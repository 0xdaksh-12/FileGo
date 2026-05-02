import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errorHandler";
import { verifyToken } from "../lib/jwt";
import { checkUserById } from "../services/userService";
import { getSession } from "../services/sessionService";
import { wrapAsync } from "../utils/tryCatchWrapper";
import { env } from "../config/env";

/**
 * Verify the authentication token and check if the user is authorized
 */
export const isAuthenticated = wrapAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    // Extract token
    const token = authorization.split(" ")[1];
    if (!token || token.trim().length === 0) {
      throw new UnauthorizedError("Malformed authorization header");
    }

    // Verify token
    const payload = verifyToken(token, env.JWT_SECRET) as any;
    const { userId, sessionId } = payload;

    if (!userId || !sessionId) {
      throw new UnauthorizedError("Invalid token payload");
    }

    // Check session
    const session = await getSession(sessionId);
    if (!session) {
      throw new UnauthorizedError("Session not found");
    }

    // Check session validity
    if (!session.valid) {
      throw new UnauthorizedError("Session is invalid");
    }

    // Check user
    const user = await checkUserById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Check user validity in session
    if (session.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError("Session user mismatch");
    }

    // Attach to request
    req.userId = userId;
    req.sessionId = sessionId;

    next();
  },
);
