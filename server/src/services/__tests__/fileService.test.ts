import mongoose from "mongoose";
import * as fileService from "../fileService";
import File from "../../models/file.model";

describe("fileService", () => {
  const userId = new mongoose.Types.ObjectId().toString();

  it("should create a file record", async () => {
    const fileData = {
      originalName: "test.png",
      s3Key: "path/to/s3",
      size: 1024,
      uuid: "unique-uuid",
      uploader: userId,
      mimeType: "image/png",
      isPasswordProtected: false,
    };

    const file = await fileService.createFileRecord(fileData);
    expect(file.originalName).toBe(fileData.originalName);
    expect(file.isPasswordProtected).toBe(false);
  });

  it("should track password protection correctly", async () => {
    const fileData = {
      originalName: "test.png",
      s3Key: "path/to/s3",
      size: 1024,
      uuid: "unique-uuid-2",
      uploader: userId,
      mimeType: "image/png",
      password: "hashedpassword",
      isPasswordProtected: true,
    };

    const file = await fileService.createFileRecord(fileData);
    expect(file.isPasswordProtected).toBe(true);
    
    // Test direct find (password should be hidden by default)
    const found = await fileService.getFileByUuid("unique-uuid-2");
    expect(found?.password).toBeUndefined();
    expect(found?.isPasswordProtected).toBe(true);
  });

  it("should soft delete a file", async () => {
    const file = await File.create({
      originalName: "delete-me.txt",
      s3Key: "key",
      size: 500,
      uuid: "uuid-3",
      uploader: userId,
      mimeType: "text/plain",
      isPasswordProtected: false,
    });

    await fileService.softDeleteFile("uuid-3");
    const found = await File.findOne({ uuid: "uuid-3" });
    expect(found?.isActive).toBe(false);
    
    // getFileByUuid should not find inactive files
    const activeFound = await fileService.getFileByUuid("uuid-3");
    expect(activeFound).toBeNull();
  });

  it("should calculate total downloads for a user", async () => {
    await File.create([
      {
        originalName: "f1.txt",
        s3Key: "k1",
        size: 100,
        uuid: "u1",
        uploader: userId,
        mimeType: "text/plain",
        downloadCount: 5,
        isPasswordProtected: false,
      },
      {
        originalName: "f2.txt",
        s3Key: "k2",
        size: 100,
        uuid: "u2",
        uploader: userId,
        mimeType: "text/plain",
        downloadCount: 10,
        isPasswordProtected: false,
      }
    ]);

    const total = await fileService.getTotalDownloads(userId);
    expect(total).toBe(15);
  });

  it("should return 0 downloads if no files exist", async () => {
    const total = await fileService.getTotalDownloads(new mongoose.Types.ObjectId().toString());
    expect(total).toBe(0);
  });
});
