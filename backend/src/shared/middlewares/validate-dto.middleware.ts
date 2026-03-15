import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError, FieldError } from '../exceptions';

export function validateDto(dtoClass: any) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const fieldErrors: FieldError[] = errors.flatMap((error) => {
        const constraints = error.constraints;
        if (!constraints) return [];
        return Object.values(constraints).map((message) => ({
          field: error.property,
          message,
        }));
      });

      next(new ValidationError('Validation failed', fieldErrors));
      return;
    }

    req.body = dtoInstance;
    next();
  };
}
