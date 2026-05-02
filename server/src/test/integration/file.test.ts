import request from "supertest";
import app from "../../app";
import { s3Mock } from "../setup";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

describe("File Integration", () => {
  let token: string;
  let cookie: string;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    token = res.body.token;
    cookie = res.headers["set-cookie"] as any;
  });

  it("should generate an upload URL", async () => {
    s3Mock.on(PutObjectCommand).resolves({});

    const res = await request(app)
      .post("/api/files/upload-url")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "test.txt",
        type: "text/plain",
        size: 1024,
        expiresAt: "1d",
      });

    expect(res.status).toBe(200);
    expect(res.body.uploadUrl).toBeDefined();
    expect(res.body.id).toBeDefined();
  });

  it("should get user files", async () => {
    await request(app)
      .post("/api/files/upload-url")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "test.txt",
        type: "text/plain",
        size: 1024,
      });

    const res = await request(app)
      .get("/api/files")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.files.length).toBe(1);
    expect(res.body.files[0].name).toBe("test.txt");
  });

  it("should delete a file", async () => {
    const uploadRes = await request(app)
      .post("/api/files/upload-url")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "test.txt",
        type: "text/plain",
        size: 1024,
      });

    const fileId = uploadRes.body.id;
    s3Mock.on(DeleteObjectCommand).resolves({});

    const res = await request(app)
      .delete(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    
    // Verify not in list
    const listRes = await request(app)
      .get("/api/files")
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.body.files.length).toBe(0);

    // TEST-2: Verify stats updated after deletion
    const statsRes = await request(app)
      .get("/api/files/stats")
      .set("Authorization", `Bearer ${token}`);
    expect(statsRes.body.activeFiles).toBe(0);
    expect(statsRes.body.storageUsed).toBe("0 B");
  });

  it("should get stats", async () => {
    await request(app)
      .post("/api/files/upload-url")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "test.txt",
        type: "text/plain",
        size: 1024,
      });

    const res = await request(app)
      .get("/api/files/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.totalUploads).toBe(1);
    expect(res.body.activeFiles).toBe(1);
    expect(res.body.storageUsed).toBe("1 KB");
  });

  describe("Password Protected Downloads", () => {
    let fileId: string;
    const password = "secure-password";

    beforeEach(async () => {
      const uploadRes = await request(app)
        .post("/api/files/upload-url")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "protected.txt",
          type: "text/plain",
          size: 1024,
          password,
        });
      fileId = uploadRes.body.id;
    });

    it("should reject download without password", async () => {
      const res = await request(app)
        .post(`/api/files/${fileId}/download`)
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Password required");
    });

    it("should reject download with wrong password", async () => {
      const res = await request(app)
        .post(`/api/files/${fileId}/download`)
        .send({ password: "wrong-password" });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Invalid password");
    });

    it("should allow download with correct password", async () => {
      const res = await request(app)
        .post(`/api/files/${fileId}/download`)
        .send({ password });

      expect(res.status).toBe(200);
      expect(res.body.downloadUrl).toBeDefined();
    });
  });

  it("should enforce ownership during deletion", async () => {
    // 1. User A uploads a file
    const uploadRes = await request(app)
      .post("/api/files/upload-url")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "userA.txt",
        type: "text/plain",
        size: 100,
      });
    const fileId = uploadRes.body.id;

    // 2. User B tries to delete User A's file
    const resB = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User B",
        email: "userB@example.com",
        password: "password123",
      });
    const tokenB = resB.body.token;

    const deleteRes = await request(app)
      .delete(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(deleteRes.status).toBe(401); // Unauthorized ownership
  });

  it("should return nextCursor for pagination", async () => {
    // Upload 3 files
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post("/api/files/upload-url")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: `test-${i}.txt`,
          type: "text/plain",
          size: 100,
        });
      // Small delay to ensure distinct createdAt
      await new Promise(r => setTimeout(r, 10));
    }

    const res = await request(app)
      .get("/api/files")
      .query({ limit: 2 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.files.length).toBe(2);
    expect(res.body.nextCursor).toBeDefined();
  });

  describe("GET /api/files/:id (Public Info)", () => {
    it("should return file info for existing file", async () => {
      const uploadRes = await request(app)
        .post("/api/files/upload-url")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "public.txt",
          type: "text/plain",
          size: 500,
        });
      const fileId = uploadRes.body.id;

      const res = await request(app).get(`/api/files/${fileId}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("public.txt");
      expect(res.body.hasPassword).toBe(false);
    });

    it("should return 404 for non-existent file", async () => {
      const res = await request(app).get("/api/files/00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(404);
    });
  });
});

