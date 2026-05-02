import { Response, Request } from "express";
import { env } from "../config/env";

const REFRESH_TOKEN_NAME = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

/**
 * Set the cookie token
 * @param {Response} res
 * @param {string} token
 */
export const setCookieToken = (res: Response, token: string) => {
  res.cookie(REFRESH_TOKEN_NAME, token, COOKIE_OPTIONS);
};

/**
 * Remove the cookie token
 * @param {Response} res
 */
export const removeCookieToken = (res: Response) => {
  res.cookie(REFRESH_TOKEN_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
};

/**
 * Get the cookie token
 * @param {Request} req
 */
export const getCookieToken = (req: Request) => {
  return req.cookies[REFRESH_TOKEN_NAME];
};
