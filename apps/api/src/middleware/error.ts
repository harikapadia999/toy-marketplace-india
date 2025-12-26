import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  // Validation errors
  if (err.name === 'ZodError') {
    return c.json(
      {
        error: 'Validation Error',
        message: 'Invalid request data',
        details: err,
      },
      400
    );
  }

  // Database errors
  if (err.message.includes('duplicate key')) {
    return c.json(
      {
        error: 'Duplicate Entry',
        message: 'A record with this information already exists',
      },
      409
    );
  }

  // Default error
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : err.message,
    },
    500
  );
};
