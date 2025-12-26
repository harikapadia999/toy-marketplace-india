import { Hono } from 'hono';
import { db } from '@toy-marketplace/database/client';
import { wishlist } from '@toy-marketplace/database';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, AuthContext } from '../middleware/auth';

const app = new Hono();

// Get user wishlist
app.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;

    const userWishlist = await db.query.wishlist.findMany({
      where: eq(wishlist.userId, user.userId),
      with: {
        toy: {
          with: {
            seller: {
              columns: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return c.json({
      success: true,
      data: userWishlist,
    });
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    return c.json({
      error: 'Failed to fetch wishlist',
      message: error.message,
    }, 500);
  }
});

// Add to wishlist
app.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const { toyId } = await c.req.json();

    // Check if already in wishlist
    const existing = await db.query.wishlist.findFirst({
      where: and(
        eq(wishlist.userId, user.userId),
        eq(wishlist.toyId, toyId)
      ),
    });

    if (existing) {
      return c.json({
        error: 'Already in Wishlist',
        message: 'This toy is already in your wishlist',
      }, 400);
    }

    const [item] = await db.insert(wishlist).values({
      userId: user.userId,
      toyId,
    }).returning();

    return c.json({
      success: true,
      message: 'Added to wishlist successfully',
      data: item,
    }, 201);
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    return c.json({
      error: 'Failed to add to wishlist',
      message: error.message,
    }, 500);
  }
});

// Remove from wishlist
app.delete('/:toyId', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const toyId = c.req.param('toyId');

    await db.delete(wishlist).where(
      and(
        eq(wishlist.userId, user.userId),
        eq(wishlist.toyId, toyId)
      )
    );

    return c.json({
      success: true,
      message: 'Removed from wishlist successfully',
    });
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    return c.json({
      error: 'Failed to remove from wishlist',
      message: error.message,
    }, 500);
  }
});

// Check if toy is in wishlist
app.get('/check/:toyId', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const toyId = c.req.param('toyId');

    const item = await db.query.wishlist.findFirst({
      where: and(
        eq(wishlist.userId, user.userId),
        eq(wishlist.toyId, toyId)
      ),
    });

    return c.json({
      success: true,
      inWishlist: !!item,
    });
  } catch (error: any) {
    console.error('Check wishlist error:', error);
    return c.json({
      error: 'Failed to check wishlist',
      message: error.message,
    }, 500);
  }
});

export { app as wishlistRoutes };
