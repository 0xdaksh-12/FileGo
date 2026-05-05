import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.Middleware";
import { OAuth2Client } from "google-auth-library";
import { Types } from "mongoose";
import { ConflictError, UnauthorizedError } from "../utils/errorHandler";
import { checkUserByEmail, createUser, getUserByEmail, getUserById } from "../services/userService";
import {
  createSession,
  saveToken,
  invalidateSession,
  checkSession,
} from "../services/sessionService";
import { hashed, compareHash } from "../lib/bcrypt";
import { generateToken, verifyToken } from "../lib/jwt";
import { setCookieToken, removeCookieToken, getCookieToken } from "../utils/tokenManager";
import { isTokenHalfExpired } from "../utils/isTokenHalfExpired";
import { wrapAsync } from "../utils/tryCatchWrapper";
import { env } from "../config/env";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

/**
 * Creates an authentication session for a user
 */
async function createAuthSession({
  userId,
  userAgent,
  ip,
}: {
  userId: string;
  userAgent: string;
  ip: string;
}) {
  const session = await createSession(userId, userAgent, ip);
  // QA-1: Use proper Types.ObjectId instead of casting to any
  const sessionId = (session._id as Types.ObjectId).toString();

  const accessToken = generateToken({ userId, sessionId }, env.JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN);
  const refreshToken = generateToken(
    { userId, sessionId },
    env.JWT_REFRESH_SECRET,
    REFRESH_TOKEN_EXPIRES_IN,
  );

  const hashedToken = await hashed(refreshToken);
  await saveToken(sessionId, hashedToken);

  return { accessToken, refreshToken };
}

export const register_user = wrapAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await checkUserByEmail(email);
  if (existing) {
    throw new ConflictError("User already exists");
  }

  const user = await createUser({
    name,
    email,
    password,
  });

  const { accessToken, refreshToken } = await createAuthSession({
    userId: (user._id as Types.ObjectId).toString(),
    userAgent: req.headers["user-agent"] || "unknown",
    ip: req.ip || "unknown",
  });

  setCookieToken(res, refreshToken);

  res.status(201).json({
    message: "User registered successfully",
    token: accessToken,
    user: { name: user.name, email: user.email },
  });
});

export const login_user = wrapAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isMatch = await compareHash(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const { accessToken, refreshToken } = await createAuthSession({
    userId: (user._id as Types.ObjectId).toString(),
    userAgent: req.headers["user-agent"] || "unknown",
    ip: req.ip || "unknown",
  });

  setCookieToken(res, refreshToken);

  res.status(200).json({
    message: "User logged in successfully",
    token: accessToken,
    user: { name: user.name, email: user.email },
  });
});

export const google_auth = wrapAsync(async (req: Request, res: Response) => {
  const { credential } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new UnauthorizedError("Invalid Google token");

  const { email, name, picture } = payload;
  let user = await getUserByEmail(email);

  if (!user) {
    user = await createUser({
      name: name || "Google User",
      email,
      password: "",
      avatar: picture,
    });
  }

  const { accessToken, refreshToken } = await createAuthSession({
    userId: (user._id as Types.ObjectId).toString(),
    userAgent: req.headers["user-agent"] || "unknown",
    ip: req.ip || "unknown",
  });

  setCookieToken(res, refreshToken);

  res.status(200).json({
    message: "User logged in successfully",
    token: accessToken,
    user: { name: user.name, email: user.email, profilePic: user.profilePic },
  });
});

export const refresh_token = wrapAsync(async (req: Request, res: Response) => {
  const cookieToken = getCookieToken(req);
  if (!cookieToken) {
    return res.status(204).send();
  }

  const payload = verifyToken(cookieToken, env.JWT_REFRESH_SECRET) as any;
  if (!payload || !payload.userId || !payload.sessionId) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const { userId, sessionId, iat, exp } = payload;

  const session = await checkSession(cookieToken, sessionId);
  if (!session) {
    throw new UnauthorizedError("Invalid Token");
  }

  const accessToken = generateToken({ userId, sessionId }, env.JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN);

  // Rotate refresh token if it's half expired
  if (isTokenHalfExpired(exp * 1000, iat * 1000)) {
    const refreshToken = generateToken(
      { userId, sessionId },
      env.JWT_REFRESH_SECRET,
      REFRESH_TOKEN_EXPIRES_IN,
    );
    const hashedToken = await hashed(refreshToken);
    await saveToken(sessionId, hashedToken);
    setCookieToken(res, refreshToken);
  }

  const user = await getUserById(userId);

  res.status(200).json({
    message: "Token refreshed successfully",
    token: accessToken,
    user: user
      ? {
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          role: user.role,
        }
      : null,
  });
});

export const logout_user = wrapAsync(async (req: AuthRequest, res: Response) => {
  removeCookieToken(res);
  const sessionId = req.sessionId as string;
  if (sessionId) {
    await invalidateSession(sessionId);
  }
  res.status(204).send();
});

export const get_user = wrapAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const user = await getUserById(userId);
  if (!user) {
    throw new UnauthorizedError("User not found");
  }
  res.status(200).json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
    },
  });
});
