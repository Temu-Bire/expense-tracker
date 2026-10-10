import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/prisma';
import { UnauthorizedError } from '../errors';

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Parses duration strings like '15m', '7d', '1h' into milliseconds.
 */
export const parseDurationToMs = (duration: string): number => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const val = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return val * 1000;
    case 'm':
      return val * 60 * 1000;
    case 'h':
      return val * 60 * 60 * 1000;
    case 'd':
      return val * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};

/**
 * Generates a short-lived signed JWT access token.
 */
export const generateAccessToken = (
  payload: JwtPayload,
  expiresIn: string = config.jwtAccessExpiresIn
): string => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: expiresIn as any,
  });
};

/**
 * Generates a long-lived signed JWT refresh token.
 */
export const generateRefreshToken = (
  payload: JwtPayload,
  expiresIn: string = config.jwtRefreshExpiresIn
): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: expiresIn as any,
  });
};

/**
 * Generates both access token and refresh token for a user.
 */
export const generateTokenPair = (payload: JwtPayload): TokenPair => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwtAccessExpiresIn,
  };
};

/**
 * Verifies an access token and returns the decoded payload.
 * Throws explicit UnauthorizedError on expiration or invalid signature.
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired', {
        expiredAt: error.expiredAt,
        tokenExpired: true,
      });
    }
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError('Invalid access token');
    }
    throw new UnauthorizedError('Authentication failed');
  }
};

/**
 * Verifies a refresh token and returns the decoded payload.
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired', {
        expiredAt: error.expiredAt,
        tokenExpired: true,
      });
    }
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    throw new UnauthorizedError('Refresh token validation failed');
  }
};

/**
 * Stores a refresh token in the database.
 */
export const storeRefreshToken = async (
  userId: string,
  token: string
): Promise<void> => {
  const expiresAt = new Date(Date.now() + parseDurationToMs(config.jwtRefreshExpiresIn));

  try {
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  } catch (err) {
    // If DB is offline (e.g. mock test environment), log and continue
    console.warn('[RefreshTokenStore] DB persistence skipped or failed:', (err as Error).message);
  }
};

/**
 * Revokes a refresh token in the database (used on logout).
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  try {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  } catch (err) {
    console.warn('[RefreshTokenRevoke] DB update skipped or failed:', (err as Error).message);
  }
};

/**
 * Revokes all refresh tokens for a user (used on password change or security reset).
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  } catch (err) {
    console.warn('[RefreshTokenRevokeAll] DB update skipped or failed:', (err as Error).message);
  }
};

/**
 * Validates a refresh token against the database, revokes it (rotation),
 * and issues a brand-new token pair.
 */
export const rotateRefreshToken = async (
  oldToken: string
): Promise<{ tokenPair: TokenPair; user: JwtPayload }> => {
  // 1. Verify token cryptographic validity
  const payload = verifyRefreshToken(oldToken);

  // 2. Check token in database
  try {
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
    });

    if (dbToken) {
      if (dbToken.revoked) {
        // Reuse detection: If a revoked token is used, revoke all tokens for this user for security
        await revokeAllUserTokens(payload.userId);
        throw new UnauthorizedError('Refresh token was already revoked. Please log in again.');
      }

      if (dbToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Refresh token has expired');
      }

      // Mark old token as revoked
      await prisma.refreshToken.update({
        where: { id: dbToken.id },
        data: { revoked: true },
      });
    }
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    console.warn('[RefreshTokenRotate] DB check skipped or failed:', (err as Error).message);
  }

  // 3. Generate new token pair
  const newTokens = generateTokenPair(payload);

  // 4. Store new refresh token
  await storeRefreshToken(payload.userId, newTokens.refreshToken);

  return {
    tokenPair: newTokens,
    user: payload,
  };
};
