import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../exceptions';
import { ApiResponse } from '../helpers/api-response';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const errors = err instanceof ValidationError ? err.errors : undefined;
    ApiResponse.error(res, err.message, err.statusCode, errors);
    return;
  }

  console.error(
    JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      stack: err.stack,
    })
  );
  ApiResponse.error(res, 'Internal server error');
}
