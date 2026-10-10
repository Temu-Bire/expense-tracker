import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/apiResponse';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors';
import { hashPassword, comparePassword } from '../services/password.service';
import {
  generateTokenPair,
  storeRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../services/token.service';

/**
 * Register a new user account.
 * Plain-text passwords are encrypted via bcrypt before persistence.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, currency } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError(`User with email '${email}' already exists`);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        currency: currency || 'USD',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currency: true,
        createdAt: true,
      },
    });

    // Generate access & refresh tokens
    const tokens = generateTokenPair({ userId: user.id, email: user.email });
    await storeRefreshToken(user.id, tokens.refreshToken);

    sendSuccess(
      res,
      {
        user,
        tokens,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user with email and password.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate fresh tokens
    const tokens = generateTokenPair({ userId: user.id, email: user.email });
    await storeRefreshToken(user.id, tokens.refreshToken);

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      tokens,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rotate refresh token: validates the old refresh token, revokes it,
 * and issues a brand-new access token + refresh token pair.
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: tokenToRotate } = req.body;

    const result = await rotateRefreshToken(tokenToRotate);

    sendSuccess(res, {
      tokens: result.tokenPair,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user by revoking the refresh token so it cannot be used again.
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: tokenToRevoke } = req.body;

    if (tokenToRevoke) {
      await revokeRefreshToken(tokenToRevoke);
    }

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve authenticated user profile (protected by authenticateToken middleware).
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError('Authentication token required');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};
