import bcrypt from "bcrypt";

/**
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashed = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
};

/**
 * @param {string} password
 * @param {string} hashPassword
 * @returns {Promise<boolean>}
 */
export const compareHash = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};
