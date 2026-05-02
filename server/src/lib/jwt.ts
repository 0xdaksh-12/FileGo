import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errorHandler";

/**
 * Generate a JWT token
 * @param {Object} payload
 * @param {string} secret
 * @param {string} expiresIn
 * @returns {string}
 */
export const generateToken = (
  payload: any,
  secret: string,
  expiresIn: string,
) => {
  if (!payload?.userId || !payload?.sessionId) {
    throw new UnauthorizedError(
      "Invalid payload: userId and sessionId are required",
    );
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verify a JWT token
 * @param {string} token
 * @param {string} secret
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token: string, secret: string) => {
  if (!token) {
    throw new UnauthorizedError("Token required");
  }

  try {
    return jwt.verify(token, secret);
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired");
    } else {
      throw new UnauthorizedError("Invalid token");
    }
  }
};
