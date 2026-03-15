import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

export const rateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for meter readings ingestion
export const meterReadingRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2,
  message: {
    status: 'error',
    message: 'Too many meter readings submitted, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
