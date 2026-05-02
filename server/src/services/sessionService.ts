import Session from '../models/session.model';
import { NotFoundError, UnauthorizedError } from '../utils/errorHandler';
import { compareHash } from '../lib/bcrypt';

/**
 * QA-2: Removed redundant try-catch-rethrow pattern. Errors propagate
 * naturally to the global error handler via wrapAsync.
 */

/**
 * Create a new session
 */
export const createSession = async (userId: string, userAgent: string, ip: string) => {
  const session = await Session.create({ userId, userAgent, ip });
  return session;
};

/**
 * Save a refresh token for a session
 */
export const saveToken = async (sessionId: string, refreshToken: string) => {
  const session = await Session.findByIdAndUpdate(
    sessionId,
    { token: refreshToken },
    { new: true },
  );
  return session;
};

/**
 * Invalidate a session
 */
export const invalidateSession = async (sessionId: string) => {
  const session = await Session.findByIdAndUpdate(
    sessionId,
    { valid: false },
    { new: true },
  );
  return session;
};

/**
 * Get a session by ID
 */
export const getSession = async (sessionId: string) => {
  const session = await Session.findById(sessionId);
  return session;
};

/**
 * Check a session — verifies it exists, is valid, and the hashed token matches
 */
export const checkSession = async (token: string, sessionId: string) => {
  const session = await getSession(sessionId);
  if (!session) throw new NotFoundError('Session not found');
  if (!session.valid) throw new UnauthorizedError('Session is invalid');
  if (!session.token) throw new UnauthorizedError('Session has no stored token');

  const isValid = await compareHash(token, session.token);
  if (!isValid) throw new UnauthorizedError('Session token mismatch');

  return session;
};
