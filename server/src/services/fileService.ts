import mongoose, { ClientSession } from "mongoose";
import File, { IFile } from "../models/file.model";

export interface CreateFileInput {
  originalName: string;
  s3Key: string;
  size: number;
  uuid: string;
  uploader: string;
  mimeType: string;
  password?: string;
  isPasswordProtected?: boolean;
  expiresAt?: Date;
}

/**
 * Create a new file record
 */
export const createFileRecord = async (
  data: CreateFileInput,
  session?: ClientSession,
): Promise<IFile> => {
  const [file] = await File.create([data], { session });
  return file;
};

/**
 * Get a file by UUID
 */
export const getFileByUuid = async (uuid: string): Promise<IFile | null> => {
  return await File.findOne({ uuid, isActive: true });
};

export const getFileByUuidWithPassword = async (uuid: string): Promise<IFile | null> => {
  return await File.findOne({ uuid, isActive: true }).select("+password");
};

/**
 * Get active files for a user with cursor-based pagination
 */
export const getUserFiles = async (
  userId: string,
  limit: number = 20,
  cursor?: string,
): Promise<IFile[]> => {
  const query: any = { uploader: userId, isActive: true };

  if (cursor) {
    // INT-2: Compound cursor (ISO timestamp + ObjectId string) prevents
    // skips/duplicates when two files share the same createdAt millisecond.
    const separatorIdx = cursor.lastIndexOf("_");
    const ts = cursor.substring(0, separatorIdx);
    const id = cursor.substring(separatorIdx + 1);
    query.$or = [
      { createdAt: { $lt: new Date(ts) } },
      { createdAt: new Date(ts), _id: { $lt: id } },
    ];
  }

  return await File.find(query).sort({ createdAt: -1, _id: -1 }).limit(limit);
};

/**
 * Soft delete a file
 */
export const softDeleteFile = async (
  uuid: string,
  session?: ClientSession,
): Promise<IFile | null> => {
  return await File.findOneAndUpdate({ uuid }, { isActive: false }, { new: true, session });
};

/**
 * Increment download count for a file
 */
export const incrementDownload = async (uuid: string): Promise<IFile | null> => {
  return await File.findOneAndUpdate({ uuid }, { $inc: { downloadCount: 1 } }, { new: true });
};

/**
 * Count active files for a user
 */
export const countUserFiles = async (userId: string): Promise<number> => {
  return await File.countDocuments({ uploader: userId, isActive: true });
};

/**
 * Count total uploads for a user (including inactive)
 */
export const countTotalUploads = async (userId: string): Promise<number> => {
  return await File.countDocuments({ uploader: userId });
};

/**
 * Get total downloads for a user's files
 */
export const getTotalDownloads = async (userId: string): Promise<number> => {
  const result = await File.aggregate([
    { $match: { uploader: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$downloadCount" } } },
  ]);
  return result[0]?.total || 0;
};
