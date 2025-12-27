import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

const strictLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 requests per 15 minutes for sensitive endpoints
  message: 'Too many attempts, please try again later.',
});

export { limiter, strictLimiter };
