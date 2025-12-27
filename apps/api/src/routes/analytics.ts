import { Hono } from 'hono';
import { cache, cacheKeys, cacheTTL } from '../lib/cache';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { toys, orders, users } from '@toy-marketplace/database';
import { eq, sql, desc, and, gte } from 'drizzle-orm';

const app = new Hono();

// Get admin dashboard stats
app.get('/stats', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Check if user is admin
    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Try to get from cache
    const cacheKey = 'admin:stats';
    const cached = await cache.get(cacheKey);
    if (cached) {
      return c.json({ success: true, data: cached, cached: true });
    }

    // Calculate date ranges
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Get total users
    const totalUsers = await db.select({ count: sql<number>`count(*)` })
      .from(users);

    // Get new users this month
    const newUsersThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, lastMonth));

    // Get total listings
    const totalListings = await db.select({ count: sql<number>`count(*)` })
      .from(toys);

    // Get active listings
    const activeListings = await db.select({ count: sql<number>`count(*)` })
      .from(toys)
      .where(eq(toys.status, 'active'));

    // Get total orders
    const totalOrders = await db.select({ count: sql<number>`count(*)` })
      .from(orders);

    // Get orders this month
    const ordersThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, lastMonth));

    // Get total revenue
    const totalRevenue = await db.select({ 
      sum: sql<number>`sum(${orders.totalAmount})` 
    }).from(orders);

    // Get revenue this month
    const revenueThisMonth = await db.select({ 
      sum: sql<number>`sum(${orders.totalAmount})` 
    })
      .from(orders)
      .where(gte(orders.createdAt, lastMonth));

    // Get category distribution
    const categoryDistribution = await db.select({
      category: toys.category,
      count: sql<number>`count(*)`,
    })
      .from(toys)
      .groupBy(toys.category)
      .orderBy(desc(sql`count(*)`));

    // Get recent orders
    const recentOrders = await db.query.orders.findMany({
      limit: 10,
      orderBy: [desc(orders.createdAt)],
      with: {
        user: true,
        items: {
          with: {
            toy: true,
          },
        },
      },
    });

    // Get top sellers
    const topSellers = await db.select({
      userId: toys.sellerId,
      count: sql<number>`count(*)`,
      revenue: sql<number>`sum(${toys.salePrice})`,
    })
      .from(toys)
      .groupBy(toys.sellerId)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const stats = {
      totalUsers: totalUsers[0].count,
      newUsersThisMonth: newUsersThisMonth[0].count,
      totalListings: totalListings[0].count,
      activeListings: activeListings[0].count,
      totalOrders: totalOrders[0].count,
      ordersThisMonth: ordersThisMonth[0].count,
      totalRevenue: totalRevenue[0].sum || 0,
      revenueThisMonth: revenueThisMonth[0].sum || 0,
      categoryDistribution,
      recentOrders,
      topSellers,
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, stats, cacheTTL.short);

    return c.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    return c.json({
      error: 'Failed to get admin stats',
      message: error.message,
    }, 500);
  }
});

// Get analytics data
app.get('/analytics', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { period = '30d' } = c.req.query();

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get daily orders
    const dailyOrders = await db.select({
      date: sql<string>`DATE(${orders.createdAt})`,
      count: sql<number>`count(*)`,
      revenue: sql<number>`sum(${orders.totalAmount})`,
    })
      .from(orders)
      .where(gte(orders.createdAt, startDate))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // Get daily signups
    const dailySignups = await db.select({
      date: sql<string>`DATE(${users.createdAt})`,
      count: sql<number>`count(*)`,
    })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    // Get daily listings
    const dailyListings = await db.select({
      date: sql<string>`DATE(${toys.createdAt})`,
      count: sql<number>`count(*)`,
    })
      .from(toys)
      .where(gte(toys.createdAt, startDate))
      .groupBy(sql`DATE(${toys.createdAt})`)
      .orderBy(sql`DATE(${toys.createdAt})`);

    return c.json({
      success: true,
      data: {
        dailyOrders,
        dailySignups,
        dailyListings,
        period,
      },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return c.json({
      error: 'Failed to get analytics',
      message: error.message,
    }, 500);
  }
});

// Get user analytics
app.get('/users/analytics', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Get user growth
    const userGrowth = await db.select({
      month: sql<string>`DATE_FORMAT(${users.createdAt}, '%Y-%m')`,
      count: sql<number>`count(*)`,
    })
      .from(users)
      .groupBy(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`);

    // Get user activity
    const activeUsers = await db.select({
      userId: orders.userId,
      orderCount: sql<number>`count(*)`,
      totalSpent: sql<number>`sum(${orders.totalAmount})`,
    })
      .from(orders)
      .groupBy(orders.userId)
      .orderBy(desc(sql`count(*)`))
      .limit(100);

    return c.json({
      success: true,
      data: {
        userGrowth,
        activeUsers,
      },
    });
  } catch (error: any) {
    console.error('Get user analytics error:', error);
    return c.json({
      error: 'Failed to get user analytics',
      message: error.message,
    }, 500);
  }
});

export { app as analyticsRoutes };
