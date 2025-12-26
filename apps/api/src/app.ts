import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { authRoutes } from './routes/auth';
import { toyRoutes } from './routes/toys';
import { userRoutes } from './routes/users';
import { orderRoutes } from './routes/orders';
import { reviewRoutes } from './routes/reviews';
import { wishlistRoutes } from './routes/wishlist';
import { errorHandler } from './middleware/error';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/toys', toyRoutes);
app.route('/api/users', userRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/reviews', reviewRoutes);
app.route('/api/wishlist', wishlistRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  }, 404);
});

// Error handler
app.onError(errorHandler);

export default app;
