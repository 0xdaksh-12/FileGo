import request from "supertest";
import app from "../../app";
import User from "../../models/user.model";
import Session from "../../models/session.model";

describe("Auth Integration", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();

    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeDefined();
    expect(user?.password).not.toBe(testUser.password); // Should be hashed
  });

  it("should return 409 if email already exists", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("already exists");
  });

  it("should login an existing user", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 401 for invalid credentials", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Invalid credentials");
  });

  it("should refresh token using cookie", async () => {
    const regRes = await request(app).post("/api/auth/register").send(testUser);
    const cookie = regRes.headers["set-cookie"] as any;

    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookie);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it("should logout user and invalidate session", async () => {
    const loginRes = await request(app).post("/api/auth/register").send(testUser);
    const cookie = loginRes.headers["set-cookie"] as any;
    const token = loginRes.body.token;

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(204);
    
    // Check session in DB
    const sessions = await Session.find({});
    expect(sessions[0].valid).toBe(false);
  });
});
