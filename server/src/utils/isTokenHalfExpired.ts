import { logger } from "./logger";

/*
 * Checks if a token is half expired
 * @param {number} expiryTimeMs
 * @param {number} issuedAtMs
 * @returns {boolean}
 */
export const isTokenHalfExpired = (expiryTimeMs: number, issuedAtMs: number): boolean => {
  if (!expiryTimeMs || !issuedAtMs) {
    return true;
  }
  try {
    const now = Date.now();
    const lifetime = expiryTimeMs - issuedAtMs;
    const elapsed = now - issuedAtMs;
    return elapsed >= lifetime / 2;
  } catch (err) {
    logger.error("Error checking token expiry", { err });
    return true;
  }
};
