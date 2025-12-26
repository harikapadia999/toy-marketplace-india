import { Hono } from 'hono';
import { db } from '@toy-marketplace/database/client';
import { users } from '@toy-marketplace/database';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthContext } from '../middleware/auth';

const app = new Hono();

// Get current user profile
app.get('/profile', authMiddleware, async (c) => {
  try {
    const authUser = c.get('user') as AuthContext;

    const user = await db.query.users.findFirst({
      where: eq(users.id, authUser.userId),
      columns: {
        password: false, // Exclude password
      },
      with: {
        toys: {
          limit: 10,
          orderBy: (toys, { desc }) => [desc(toys.createdAt)],
        },
        addresses: true,
      },
    });

    if (!user) {
      return c.json({
        error: 'Not Found',
        message: 'User not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.json({
      error: 'Failed to fetch profile',
      message: error.message,
    }, 500);
  }
});

// Update user profile
app.put('/profile', authMiddleware, async (c) => {
  try {
    const authUser = c.get('user') as AuthContext;
    const data = await c.req.json();

    // Don't allow updating sensitive fields
    delete data.password;
    delete data.email;
    delete data.phone;
    delete data.role;
    delete data.isVerified;

    const [updatedUser] = await db.update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, authUser.userId))
      .returning();

    const { password, ...userWithoutPassword } = updatedUser;

    return c.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return c.json({
      error: 'Failed to update profile',
      message: error.message,
    }, 500);
  }
});

// Get user by ID (public)
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        name: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
      with: {
        toys: {
          where: (toys, { eq }) => eq(toys.status, 'active'),
          limit: 10,
          orderBy: (toys, { desc }) => [desc(toys.createdAt)],
        },
      },
    });

    if (!user) {
      return c.json({
        error: 'Not Found',
        message: 'User not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return c.json({
      error: 'Failed to fetch user',
      message: error.message,
    }, 500);
  }
});

export { app as userRoutes };
