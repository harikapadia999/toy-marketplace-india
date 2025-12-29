import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { notifications } from '@toy-marketplace/database';
import { eq, desc, and } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';

const app = new Hono();

// Get user notifications
app.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { page = 1, limit = 20, unreadOnly = false } = c.req.query();

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = unreadOnly === 'true' 
      ? and(eq(notifications.userId, user.id), eq(notifications.read, false))
      : eq(notifications.userId, user.id);

    const userNotifications = await db.query.notifications.findMany({
      where,
      limit: parseInt(limit),
      offset,
      orderBy: [desc(notifications.createdAt)],
    });

    const total = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(where);

    return c.json({
      success: true,
      data: userNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].count,
        pages: Math.ceil(total[0].count / parseInt(limit)),
      },
    });
  } catch (error: any) {
    logError('Get notifications error', error);
    return c.json({
      error: 'Failed to get notifications',
      message: error.message,
    }, 500);
  }
});

// Mark notification as read
app.patch('/:id/read', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();

    await db.update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.id)
      ));

    return c.json({ success: true });
  } catch (error: any) {
    logError('Mark notification read error', error);
    return c.json({
      error: 'Failed to mark notification as read',
      message: error.message,
    }, 500);
  }
});

// Mark all notifications as read
app.patch('/read-all', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, user.id));

    return c.json({ success: true });
  } catch (error: any) {
    logError('Mark all notifications read error', error);
    return c.json({
      error: 'Failed to mark all notifications as read',
      message: error.message,
    }, 500);
  }
});

// Delete notification
app.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();

    await db.delete(notifications)
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.id)
      ));

    return c.json({ success: true });
  } catch (error: any) {
    logError('Delete notification error', error);
    return c.json({
      error: 'Failed to delete notification',
      message: error.message,
    }, 500);
  }
});

// Get unread count
app.get('/unread-count', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const count = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, user.id),
        eq(notifications.read, false)
      ));

    return c.json({
      success: true,
      count: count[0].count,
    });
  } catch (error: any) {
    logError('Get unread count error', error);
    return c.json({
      error: 'Failed to get unread count',
      message: error.message,
    }, 500);
  }
});

export { app as notificationsRoutes };
