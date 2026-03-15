import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200): void {
    res.status(statusCode).json({ status: 'success', data });
  }

  static created<T>(res: Response, data: T): void {
    res.status(201).json({ status: 'success', data });
  }

  static message(res: Response, message: string, statusCode = 200): void {
    res.status(statusCode).json({ status: 'success', message });
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: { field: string; message: string }[]
  ): void {
    const body: Record<string, unknown> = { status: 'error', message };
    if (errors?.length) {
      body.errors = errors;
    }
    res.status(statusCode).json(body);
  }
}
