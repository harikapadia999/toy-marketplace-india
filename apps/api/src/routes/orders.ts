import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '@toy-marketplace/database/client';
import { orders, insertOrderSchema } from '@toy-marketplace/database';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthContext } from '../middleware/auth';

const app = new Hono();

// Create order
app.post('/', authMiddleware, zValidator('json', insertOrderSchema), async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const data = c.req.valid('json');

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const [order] = await db.insert(orders).values({
      ...data,
      buyerId: user.userId,
      orderNumber,
    }).returning();

    return c.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    }, 201);
  } catch (error: any) {
    console.error('Create order error:', error);
    return c.json({
      error: 'Failed to create order',
      message: error.message,
    }, 500);
  }
});

// Get user orders
app.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.buyerId, user.userId),
      orderBy: desc(orders.createdAt),
      with: {
        toy: true,
        seller: {
          columns: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      data: userOrders,
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return c.json({
      error: 'Failed to fetch orders',
      message: error.message,
    }, 500);
  }
});

// Get single order
app.get('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const id = c.req.param('id');

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, id),
        eq(orders.buyerId, user.userId)
      ),
      with: {
        toy: true,
        seller: {
          columns: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!order) {
      return c.json({
        error: 'Not Found',
        message: 'Order not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    return c.json({
      error: 'Failed to fetch order',
      message: error.message,
    }, 500);
  }
});

// Update order status
app.patch('/:id/status', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as AuthContext;
    const id = c.req.param('id');
    const { status } = await c.req.json();

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!order) {
      return c.json({
        error: 'Not Found',
        message: 'Order not found',
      }, 404);
    }

    // Only buyer or seller can update
    if (order.buyerId !== user.userId && order.sellerId !== user.userId && user.role !== 'admin') {
      return c.json({
        error: 'Forbidden',
        message: 'You cannot update this order',
      }, 403);
    }

    const [updatedOrder] = await db.update(orders)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === 'delivered' && { deliveredAt: new Date() }),
        ...(status === 'cancelled' && { cancelledAt: new Date() }),
      })
      .where(eq(orders.id, id))
      .returning();

    return c.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    return c.json({
      error: 'Failed to update order',
      message: error.message,
    }, 500);
  }
});

export { app as orderRoutes };
