import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { toys, orders, users, reviews } from '@toy-marketplace/database';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';

const app = new Hono();

// Get dashboard overview
app.get('/overview', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Get counts
    const [totalUsers] = await db.select({ count: sql<number>`count(*)` })
      .from(users);

    const [totalToys] = await db.select({ count: sql<number>`count(*)` })
      .from(toys);

    const [totalOrders] = await db.select({ count: sql<number>`count(*)` })
      .from(orders);

    const [totalRevenue] = await db.select({ 
      sum: sql<number>`sum(${orders.totalAmount})` 
    }).from(orders).where(eq(orders.status, 'delivered'));

    // Get recent activity
    const recentOrders = await db.query.orders.findMany({
      limit: 10,
      orderBy: [desc(orders.createdAt)],
      with: {
        buyer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const recentUsers = await db.query.users.findMany({
      limit: 10,
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return c.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers.count,
          totalToys: totalToys.count,
          totalOrders: totalOrders.count,
          totalRevenue: totalRevenue.sum || 0,
        },
        recentOrders,
        recentUsers,
      },
    });
  } catch (error: any) {
    logError('Get dashboard overview error', error);
    return c.json({
      error: 'Failed to get dashboard overview',
      message: error.message,
    }, 500);
  }
});

// Get sales analytics
app.get('/analytics/sales', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { startDate, endDate, groupBy = 'day' } = c.req.query();

    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00:00';
        break;
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'IYYY-IW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const salesData = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at, ${dateFormat}) as period,
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE status = 'delivered'
        ${startDate ? sql`AND created_at >= ${startDate}` : sql``}
        ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
      GROUP BY period
      ORDER BY period DESC
    `);

    return c.json({
      success: true,
      data: salesData.rows,
    });
  } catch (error: any) {
    logError('Get sales analytics error', error);
    return c.json({
      error: 'Failed to get sales analytics',
      message: error.message,
    }, 500);
  }
});

// Get user analytics
app.get('/analytics/users', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { startDate, endDate } = c.req.query();

    const userStats = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COUNT(*) as new_users,
        COUNT(*) FILTER (WHERE role = 'seller') as new_sellers
      FROM users
      ${startDate ? sql`WHERE created_at >= ${startDate}` : sql``}
      ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
      GROUP BY date
      ORDER BY date DESC
    `);

    return c.json({
      success: true,
      data: userStats.rows,
    });
  } catch (error: any) {
    logError('Get user analytics error', error);
    return c.json({
      error: 'Failed to get user analytics',
      message: error.message,
    }, 500);
  }
});

// Get product analytics
app.get('/analytics/products', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Top selling products
    const topProducts = await db.execute(sql`
      SELECT 
        t.id,
        t.title,
        t.category,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_revenue
      FROM toys t
      JOIN orders o ON o.toy_id = t.id
      WHERE o.status = 'delivered'
      GROUP BY t.id, t.title, t.category
      ORDER BY order_count DESC
      LIMIT 10
    `);

    // Category distribution
    const categoryStats = await db.execute(sql`
      SELECT 
        category,
        COUNT(*) as toy_count,
        AVG(price) as avg_price
      FROM toys
      WHERE status = 'active'
      GROUP BY category
      ORDER BY toy_count DESC
    `);

    return c.json({
      success: true,
      data: {
        topProducts: topProducts.rows,
        categoryStats: categoryStats.rows,
      },
    });
  } catch (error: any) {
    logError('Get product analytics error', error);
    return c.json({
      error: 'Failed to get product analytics',
      message: error.message,
    }, 500);
  }
});

// Get revenue analytics
app.get('/analytics/revenue', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const revenueStats = await db.execute(sql`
      SELECT 
        SUM(total_amount) as total_revenue,
        SUM(total_amount) FILTER (WHERE status = 'delivered') as completed_revenue,
        SUM(total_amount) FILTER (WHERE status = 'pending') as pending_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders
      FROM orders
    `);

    return c.json({
      success: true,
      data: revenueStats.rows[0],
    });
  } catch (error: any) {
    logError('Get revenue analytics error', error);
    return c.json({
      error: 'Failed to get revenue analytics',
      message: error.message,
    }, 500);
  }
});

// Manage users
app.get('/users', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { page = 1, limit = 20, search, role, status } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [];
    if (search) {
      whereConditions.push(sql`(name ILIKE ${`%${search}%`} OR email ILIKE ${`%${search}%`})`);
    }
    if (role) {
      whereConditions.push(sql`role = ${role}`);
    }
    if (status) {
      whereConditions.push(sql`status = ${status}`);
    }

    const allUsers = await db.query.users.findMany({
      limit: parseInt(limit),
      offset,
      orderBy: [desc(users.createdAt)],
    });

    return c.json({
      success: true,
      data: allUsers,
    });
  } catch (error: any) {
    logError('Get users error', error);
    return c.json({
      error: 'Failed to get users',
      message: error.message,
    }, 500);
  }
});

// Update user status
app.patch('/users/:id/status', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { id } = c.req.param();
    const { status } = await c.req.json();

    await db.update(users)
      .set({ status })
      .where(eq(users.id, id));

    logInfo('User status updated', { userId: id, status });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Update user status error', error);
    return c.json({
      error: 'Failed to update user status',
      message: error.message,
    }, 500);
  }
});

// Manage listings
app.get('/listings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { page = 1, limit = 20, status } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? eq(toys.status, status) : undefined;

    const listings = await db.query.toys.findMany({
      where,
      limit: parseInt(limit),
      offset,
      orderBy: [desc(toys.createdAt)],
      with: {
        seller: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      data: listings,
    });
  } catch (error: any) {
    logError('Get listings error', error);
    return c.json({
      error: 'Failed to get listings',
      message: error.message,
    }, 500);
  }
});

// Approve/reject listing
app.patch('/listings/:id/status', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { id } = c.req.param();
    const { status, reason } = await c.req.json();

    await db.update(toys)
      .set({ 
        status,
        rejectionReason: reason,
      })
      .where(eq(toys.id, id));

    logInfo('Listing status updated', { toyId: id, status });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Update listing status error', error);
    return c.json({
      error: 'Failed to update listing status',
      message: error.message,
    }, 500);
  }
});

export { app as adminRoutes };
