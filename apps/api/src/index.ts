import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import listingRoutes from './routes/listings';
import transactionRoutes from './routes/transactions';
import messageRoutes from './routes/messages';
import reviewRoutes from './routes/reviews';
import wishlistRoutes from './routes/wishlists';
import notificationRoutes from './routes/notifications';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Toy Marketplace API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/users', userRoutes);
app.route('/api/v1/listings', listingRoutes);
app.route('/api/v1/transactions', transactionRoutes);
app.route('/api/v1/messages', messageRoutes);
app.route('/api/v1/reviews', reviewRoutes);
app.route('/api/v1/wishlists', wishlistRoutes);
app.route('/api/v1/notifications', notificationRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource was not found',
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  
  return c.json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '4000');

console.log(`🚀 Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`);
  console.log(`📚 API Documentation: http://localhost:${info.port}/api/v1`);
  console.log(`🏥 Health Check: http://localhost:${info.port}/health`);
});

export default app;
