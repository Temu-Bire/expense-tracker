import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';
import { UnauthorizedError } from '../errors';

/**
 * Authentication middleware that verifies the JWT access token from the Authorization header.
 * Attaches req.user ({ userId, email }) to the request on success.
 */
export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedError('Invalid authorization format. Format must be: Bearer <token>');
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware:
 * Attaches req.user if a valid token is present, but allows request to continue if not.
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  try {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      const payload = verifyAccessToken(parts[1]);
      req.user = {
        userId: payload.userId,
        email: payload.email,
      };
    }
  } catch {
    // Silently ignore for optional auth
  }

  next();
};
