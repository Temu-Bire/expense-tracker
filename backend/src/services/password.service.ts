import bcrypt from 'bcryptjs';
import { config } from '../config/env';

/**
 * Hashes a plain-text password using bcrypt with configured salt rounds.
 * Plain-text passwords must never be persisted.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcryptSaltRounds);
};

/**
 * Safely compares a plain-text password candidate against a stored bcrypt hash.
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
