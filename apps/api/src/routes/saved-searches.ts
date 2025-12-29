import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { savedSearches } from '@toy-marketplace/database';
import { eq, desc } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';

const app = new Hono();

// Create saved search
app.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { name, query, notifyOnNew } = await c.req.json();

    const newSearch = await db.insert(savedSearches)
      .values({
        userId: user.id,
        name,
        query,
        notifyOnNew,
      })
      .returning();

    logInfo('Saved search created', { searchId: newSearch[0].id });

    return c.json({
      success: true,
      data: newSearch[0],
    });
  } catch (error: any) {
    logError('Create saved search error', error);
    return c.json({
      error: 'Failed to create saved search',
      message: error.message,
    }, 500);
  }
});

// Get user's saved searches
app.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const searches = await db.query.savedSearches.findMany({
      where: eq(savedSearches.userId, user.id),
      orderBy: [desc(savedSearches.createdAt)],
    });

    return c.json({
      success: true,
      data: searches,
    });
  } catch (error: any) {
    logError('Get saved searches error', error);
    return c.json({
      error: 'Failed to get saved searches',
      message: error.message,
    }, 500);
  }
});

// Update saved search
app.patch('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    const updateData = await c.req.json();

    await db.update(savedSearches)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(savedSearches.id, id));

    return c.json({ success: true });
  } catch (error: any) {
    logError('Update saved search error', error);
    return c.json({
      error: 'Failed to update saved search',
      message: error.message,
    }, 500);
  }
});

// Delete saved search
app.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();

    await db.delete(savedSearches)
      .where(eq(savedSearches.id, id));

    return c.json({ success: true });
  } catch (error: any) {
    logError('Delete saved search error', error);
    return c.json({
      error: 'Failed to delete saved search',
      message: error.message,
    }, 500);
  }
});

export { app as savedSearchesRoutes };
