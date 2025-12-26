import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@toy-marketplace/database/client';
import { reviews, insertReviewSchema } from '@toy-marketplace/database';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, optionalAuthMiddleware, AuthContext } from '../middleware/auth';

const app = new Hono();

// Get reviews for a toy
app.get('/toy/:toyId', optionalAuthMiddleware, async (c) => {
  try {
    const toyId = c.req.param('toyId');

    const toyReviews = await db.query.reviews.findMany({
      where: eq(reviews.toyId, toyId),
      orderBy: desc(reviews.createdAt),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      data: toyReviews,
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return c.json({
      error: 'Failed to fetch reviews',
      message: error.message,
    }, 500);
  }
});

// Create review
app.post('/', authMiddleware, zValidator('json', insertReviewSchema), async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const data = c.req.valid('json');

    // Check if user already reviewed this toy
    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.userId, user.userId),
        eq(reviews.toyId, data.toyId)
      ),
    });

    if (existingReview) {
      return c.json({
        error: 'Already Reviewed',
        message: 'You have already reviewed this toy',
      }, 400);
    }

    const [review] = await db.insert(reviews).values({
      ...data,
      userId: user.userId,
    }).returning();

    return c.json({
      success: true,
      message: 'Review created successfully',
      data: review,
    }, 201);
  } catch (error: any) {
    console.error('Create review error:', error);
    return c.json({
      error: 'Failed to create review',
      message: error.message,
    }, 500);
  }
});

// Update review
app.put('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const id = c.req.param('id');
    const data = await c.req.json();

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, id),
    });

    if (!review) {
      return c.json({
        error: 'Not Found',
        message: 'Review not found',
      }, 404);
    }

    if (review.userId !== user.userId) {
      return c.json({
        error: 'Forbidden',
        message: 'You can only update your own reviews',
      }, 403);
    }

    const [updatedReview] = await db.update(reviews)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();

    return c.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (error: any) {
    console.error('Update review error:', error);
    return c.json({
      error: 'Failed to update review',
      message: error.message,
    }, 500);
  }
});

// Delete review
app.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const id = c.req.param('id');

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, id),
    });

    if (!review) {
      return c.json({
        error: 'Not Found',
        message: 'Review not found',
      }, 404);
    }

    if (review.userId !== user.userId && user.role !== 'admin') {
      return c.json({
        error: 'Forbidden',
        message: 'You can only delete your own reviews',
      }, 403);
    }

    await db.delete(reviews).where(eq(reviews.id, id));

    return c.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete review error:', error);
    return c.json({
      error: 'Failed to delete review',
      message: error.message,
    }, 500);
  }
});

export { app as reviewRoutes };
