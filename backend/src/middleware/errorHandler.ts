import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(
      res,
      err.statusCode,
      err.errorCode,
      err.message,
      err.details,
      req.originalUrl
    );
    return;
  }

  // Handle unexpected syntax errors (e.g. malformed JSON in body)
  if ('status' in err && typeof err.status === 'number' && err.status === 400) {
    sendError(
      res,
      400,
      'INVALID_JSON_PAYLOAD',
      'Malformed JSON payload received in request body',
      undefined,
      req.originalUrl
    );
    return;
  }

  // Log unhandled server error
  console.error('[UNHANDLED_ERROR]', err);

  const isProduction = process.env.NODE_ENV === 'production';
  sendError(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    isProduction ? 'An unexpected internal error occurred' : err.message,
    isProduction ? undefined : { stack: err.stack },
    req.originalUrl
  );
};
