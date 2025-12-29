import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { reports } from '@toy-marketplace/database';
import { eq, desc } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';

const app = new Hono();

// Create report
app.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { reportedType, reportedId, reason, description } = await c.req.json();

    const newReport = await db.insert(reports)
      .values({
        reporterId: user.id,
        reportedType,
        reportedId,
        reason,
        description,
      })
      .returning();

    logInfo('Report created', {
      reportId: newReport[0].id,
      reportedType,
      reportedId,
    });

    return c.json({
      success: true,
      data: newReport[0],
    });
  } catch (error: any) {
    logError('Create report error', error);
    return c.json({
      error: 'Failed to create report',
      message: error.message,
    }, 500);
  }
});

// Get user's reports
app.get('/my-reports', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const userReports = await db.query.reports.findMany({
      where: eq(reports.reporterId, user.id),
      orderBy: [desc(reports.createdAt)],
    });

    return c.json({
      success: true,
      data: userReports,
    });
  } catch (error: any) {
    logError('Get user reports error', error);
    return c.json({
      error: 'Failed to get reports',
      message: error.message,
    }, 500);
  }
});

// Admin: Get all reports
app.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { status, page = 1, limit = 20 } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? eq(reports.status, status) : undefined;

    const allReports = await db.query.reports.findMany({
      where,
      limit: parseInt(limit),
      offset,
      orderBy: [desc(reports.createdAt)],
      with: {
        reporter: {
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
      data: allReports,
    });
  } catch (error: any) {
    logError('Get all reports error', error);
    return c.json({
      error: 'Failed to get reports',
      message: error.message,
    }, 500);
  }
});

// Admin: Update report status
app.patch('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { id } = c.req.param();
    const { status, resolution } = await c.req.json();

    await db.update(reports)
      .set({
        status,
        resolution,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      })
      .where(eq(reports.id, id));

    logInfo('Report updated', { reportId: id, status });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Update report error', error);
    return c.json({
      error: 'Failed to update report',
      message: error.message,
    }, 500);
  }
});

export { app as reportsRoutes };
