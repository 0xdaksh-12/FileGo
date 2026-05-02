import {
  createUser,
  checkUserByEmail,
  checkUserById,
  getUserByEmail,
} from "../userService";
import User from "../../models/user.model";

describe("UserService", () => {
  it("should create a new user", async () => {
    const rawPassword = "password123";
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: rawPassword,
    };

    const user = await createUser(userData);

    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).not.toBe(rawPassword); // Should be hashed
  });

  it("should find a user by email", async () => {
    const email = "find@example.com";
    await User.create({
      name: "Find Me",
      email,
      password: "hashedpassword",
    });

    const user = await getUserByEmail(email);

    expect(user).toBeDefined();
    expect(user?.email).toBe(email);
  });

  it("should return false if user not found by email", async () => {
    const user = await checkUserByEmail("nonexistent@example.com");
    expect(user).toBe(false);
  });

  it("should return false if user not found by ID", async () => {
    const user = await checkUserById("691198726e22aa9b9f7fc153");
    expect(user).toBe(false);
  });
});
