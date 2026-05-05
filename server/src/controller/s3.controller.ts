import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import path from "path";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.Middleware";
import s3 from "../lib/s3";
import { wrapAsync } from "../utils/tryCatchWrapper";
import { formatBytes, parseUploadOptions } from "../utils/helper";
import { NotFoundError, UnauthorizedError } from "../utils/errorHandler";
import { hashed, compareHash } from "../lib/bcrypt";
import * as fileService from "../services/fileService";
import { updateUserStorage, getUserById } from "../services/userService";
import { env } from "../config/env";

import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const getUploadUrl = wrapAsync(async (req: AuthRequest, res: Response) => {
  const { name, type, size, expiresAt: expiry, password } = req.body;
  const uuid = randomUUID();
  const userId = req.userId as string;
  // SEC-7: Strip path separators and sanitize filename before embedding in S3 key
  const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const s3Key = `${userId}/${uuid}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: s3Key,
    ContentType: type,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const parsedExpiry = parseUploadOptions(expiry);
  const hashedPassword = password ? await hashed(password) : undefined;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const file = await fileService.createFileRecord(
      {
        originalName: name,
        s3Key,
        size,
        uuid,
        uploader: userId,
        mimeType: type,
        password: hashedPassword,
        isPasswordProtected: !!hashedPassword,
        expiresAt: parsedExpiry ?? undefined,
      },
      session,
    );

    // Update user storage
    await updateUserStorage(userId, size, session);

    await session.commitTransaction();

    res.json({
      id: file.uuid,
      uploadUrl,
      file: {
        name: file.originalName,
        size: file.size,
        expiry,
        hasPassword: file.isPasswordProtected,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const downloadFileUrl = wrapAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body || {};

  // Re-fetch with password for verification
  const fileWithPassword = await fileService.getFileByUuidWithPassword(id as string);
  if (!fileWithPassword) throw new NotFoundError("File not found");

  if (fileWithPassword.password) {
    if (!password) throw new UnauthorizedError("Password required");
    const isMatch = await compareHash(password, fileWithPassword.password);
    if (!isMatch) throw new UnauthorizedError("Invalid password");
  }

  await fileService.incrementDownload(id as string);

  const command = new GetObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: fileWithPassword.s3Key,
    ResponseContentDisposition: `attachment; filename="${fileWithPassword.originalName}"`,
    ResponseContentType: fileWithPassword.mimeType,
  });

  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  res.json({ downloadUrl });
});

export const getStatsS3 = wrapAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;

  const [totalUploads, activeFiles, totalDownloads, user] = await Promise.all([
    fileService.countTotalUploads(userId),
    fileService.countUserFiles(userId),
    fileService.getTotalDownloads(userId),
    getUserById(userId),
  ]);

  res.json({
    totalUploads,
    totalDownloads,
    activeFiles,
    storageUsed: formatBytes(user?.storageBytes || 0),
  });
});

export const getAllFiles = wrapAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const { limit, cursor } = req.query;
  const parsedLimit = limit ? parseInt(limit as string) : 20;

  const files = await fileService.getUserFiles(userId, parsedLimit, cursor as string);

  // INT-4: Only emit a cursor when the page is exactly full (more pages may exist)
  const nextCursor =
    files.length === parsedLimit
      ? `${files[files.length - 1].createdAt.toISOString()}_${files[files.length - 1]._id}`
      : null;

  res.json({
    files: files.map((file) => ({
      id: file.uuid,
      name: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      downloadCount: file.downloadCount,
      uploadedAt: file.createdAt,
      expiresAt: file.expiresAt,
      hasPassword: file.isPasswordProtected,
      isActive: file.isActive,
    })),
    nextCursor,
  });
});

export const deleteFile = wrapAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId as string;

  const file = await fileService.getFileByUuid(id as string);
  if (!file) throw new NotFoundError("File not found");

  // Check ownership
  if (file.uploader.toString() !== userId.toString()) {
    throw new UnauthorizedError("Unauthorized");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await fileService.softDeleteFile(id as string, session);

    // Update user storage
    await updateUserStorage(userId, -file.size, session);

    await session.commitTransaction();

    // INT-1: Delete from S3 after DB commit. If S3 fails, log and continue —
    // the record is soft-deleted in DB. A background job can clean up orphans.
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: file.s3Key,
      });
      await s3.send(deleteCommand);
    } catch (s3Err) {
      logger.error("S3 delete failed — object orphaned, queued for cleanup", {
        s3Key: file.s3Key,
        error: s3Err,
      });
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const getFile = wrapAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = await fileService.getFileByUuid(id as string);

  if (!file) throw new NotFoundError("File not found");

  res.json({
    id: file.uuid,
    name: file.originalName,
    size: file.size,
    mimeType: file.mimeType,
    downloadCount: file.downloadCount,
    uploadedAt: file.createdAt,
    expiresAt: file.expiresAt,
    hasPassword: file.isPasswordProtected,
    isActive: file.isActive,
  });
});
