import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { collectPerformanceMetrics, performanceThresholds } from '../lib/performance';
import { getCacheStats } from '../middleware/cache';
import { db } from '@toy-marketplace/database/client';
import { sql } from 'drizzle-orm';
import os from 'os';

const app = new Hono();

// Health check endpoint
app.get('/health', async (c) => {
  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      error: 'Database connection failed',
    }, 503);
  }
});

// Readiness check
app.get('/ready', async (c) => {
  try {
    // Check all critical services
    await db.execute(sql`SELECT 1`);
    // Check Redis
    // await cache.exists('health-check');

    return c.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      status: 'not ready',
      error: 'Services not ready',
    }, 503);
  }
});

// Liveness check
app.get('/live', (c) => {
  return c.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

// Performance metrics
app.get('/metrics', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Only admins can access metrics
    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const metrics = collectPerformanceMetrics();
    const cacheStats = await getCacheStats();

    // System metrics
    const systemMetrics = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
    };

    // Process metrics
    const processMetrics = {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
    };

    return c.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        system: systemMetrics,
        process: processMetrics,
        cache: cacheStats,
        thresholds: performanceThresholds,
      },
    });
  } catch (error: any) {
    return c.json({
      error: 'Failed to collect metrics',
      message: error.message,
    }, 500);
  }
});

// Database metrics
app.get('/metrics/database', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Get database statistics
    const stats = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        n_live_tup AS row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    // Get connection stats
    const connections = await db.execute(sql`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle
      FROM pg_stat_activity
    `);

    return c.json({
      success: true,
      data: {
        tables: stats.rows,
        connections: connections.rows[0],
      },
    });
  } catch (error: any) {
    return c.json({
      error: 'Failed to get database metrics',
      message: error.message,
    }, 500);
  }
});

// API metrics
app.get('/metrics/api', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // This would typically come from a metrics store
    // For now, return mock data
    const apiMetrics = {
      totalRequests: 10000,
      successfulRequests: 9800,
      failedRequests: 200,
      averageResponseTime: 150,
      p95ResponseTime: 300,
      p99ResponseTime: 500,
      requestsPerSecond: 50,
      errorRate: 0.02,
    };

    return c.json({
      success: true,
      data: apiMetrics,
    });
  } catch (error: any) {
    return c.json({
      error: 'Failed to get API metrics',
      message: error.message,
    }, 500);
  }
});

// Cache metrics
app.get('/metrics/cache', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const cacheStats = await getCacheStats();

    return c.json({
      success: true,
      data: cacheStats,
    });
  } catch (error: any) {
    return c.json({
      error: 'Failed to get cache metrics',
      message: error.message,
    }, 500);
  }
});

// Error metrics
app.get('/metrics/errors', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // This would typically come from error tracking service
    const errorMetrics = {
      total: 50,
      byType: {
        '4xx': 30,
        '5xx': 20,
      },
      topErrors: [
        { message: 'Validation error', count: 15 },
        { message: 'Not found', count: 10 },
        { message: 'Database error', count: 8 },
      ],
    };

    return c.json({
      success: true,
      data: errorMetrics,
    });
  } catch (error: any) {
    return c.json({
      error: 'Failed to get error metrics',
      message: error.message,
    }, 500);
  }
});

export { app as monitoringRoutes };
