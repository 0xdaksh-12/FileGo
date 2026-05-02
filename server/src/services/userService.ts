import mongoose, { ClientSession } from "mongoose";
import User from "../models/user.model";
import { hashed } from "../lib/bcrypt";

export interface CreateUserInput {
  email: string;
  name?: string;
  password?: string; // raw password
  googleId?: string;
  avatar?: string;
}

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserInput) => {
  const finalData = { ...userData };
  if (finalData.password) {
    finalData.password = await hashed(finalData.password);
  }
  const user = await User.create(finalData);
  return user;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email }).select("+password");
  return user;
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  return user;
};

/**
 * Check if a user exists by email
 */
export const checkUserByEmail = async (email: string) => {
  const user = await User.findOne({ email });
  return !!user;
};

/**
 * Check if a user exists by ID
 */
export const checkUserById = async (id: string) => {
  const user = await User.findById(id);
  return !!user;
};

/**
 * Update user storage usage
 */
export const updateUserStorage = async (
  id: string,
  bytes: number,
  session?: ClientSession,
) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $inc: { storageBytes: bytes } },
    { new: true, session },
  );
  return user;
};
