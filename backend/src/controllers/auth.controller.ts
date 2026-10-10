import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/apiResponse';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors';

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

    // In production, use bcrypt/argon2 hashing
    const passwordHash = `hashed_${password}`;

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

    sendSuccess(
      res,
      {
        user,
        token: `mock_jwt_token_${user.id}`,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== `hashed_${password}`) {
      throw new UnauthorizedError('Invalid email or password');
    }

    sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency,
      },
      token: `mock_jwt_token_${user.id}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
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
