import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { activityLogs } from '@toy-marketplace/database';
import { eq, desc } from 'drizzle-orm';

const app = new Hono();

// Log activity
export const logActivity = async (
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: any,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    await db.insert(activityLogs).values({
      userId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Get user activity logs
app.get('/my-activity', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { page = 1, limit = 50 } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const logs = await db.query.activityLogs.findMany({
      where: eq(activityLogs.userId, user.id),
      limit: parseInt(limit),
      offset,
      orderBy: [desc(activityLogs.createdAt)],
    });

    return c.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return c.json({
      error: 'Failed to get activity logs',
      message: error.message,
    }, 500);
  }
});

// Admin: Get all activity logs
app.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { page = 1, limit = 100, action, userId } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where;
    if (action) {
      where = eq(activityLogs.action, action);
    } else if (userId) {
      where = eq(activityLogs.userId, userId);
    }

    const logs = await db.query.activityLogs.findMany({
      where,
      limit: parseInt(limit),
      offset,
      orderBy: [desc(activityLogs.createdAt)],
      with: {
        user: {
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
      data: logs,
    });
  } catch (error: any) {
    return c.json({
      error: 'Failed to get activity logs',
      message: error.message,
    }, 500);
  }
});

export { app as activityLogsRoutes };
