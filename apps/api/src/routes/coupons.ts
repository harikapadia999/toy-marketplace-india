import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { coupons, couponUsage } from '@toy-marketplace/database';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';

const app = new Hono();

// Validate coupon
app.post('/validate', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { code, orderAmount } = await c.req.json();

    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.code, code.toUpperCase()),
        eq(coupons.active, true),
        lte(coupons.validFrom, new Date()),
        gte(coupons.validUntil, new Date())
      ),
    });

    if (!coupon) {
      return c.json({
        success: false,
        error: 'Invalid or expired coupon',
      }, 400);
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return c.json({
        success: false,
        error: 'Coupon usage limit reached',
      }, 400);
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount < parseFloat(coupon.minOrderAmount)) {
      return c.json({
        success: false,
        error: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      }, 400);
    }

    // Check if user already used this coupon
    const usage = await db.query.couponUsage.findFirst({
      where: and(
        eq(couponUsage.couponId, coupon.id),
        eq(couponUsage.userId, user.id)
      ),
    });

    if (usage) {
      return c.json({
        success: false,
        error: 'You have already used this coupon',
      }, 400);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (orderAmount * parseFloat(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
      }
    } else {
      discountAmount = parseFloat(coupon.value);
    }

    return c.json({
      success: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountAmount,
        finalAmount: orderAmount - discountAmount,
      },
    });
  } catch (error: any) {
    logError('Validate coupon error', error);
    return c.json({
      error: 'Failed to validate coupon',
      message: error.message,
    }, 500);
  }
});

// Apply coupon to order
app.post('/apply', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { couponId, orderId, discountAmount } = await c.req.json();

    // Record coupon usage
    await db.insert(couponUsage).values({
      couponId,
      userId: user.id,
      orderId,
      discountAmount,
    });

    // Increment usage count
    await db.update(coupons)
      .set({ 
        usageCount: sql`${coupons.usageCount} + 1` 
      })
      .where(eq(coupons.id, couponId));

    logInfo('Coupon applied', { couponId, orderId, userId: user.id });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Apply coupon error', error);
    return c.json({
      error: 'Failed to apply coupon',
      message: error.message,
    }, 500);
  }
});

// Get available coupons
app.get('/available', authMiddleware, async (c) => {
  try {
    const availableCoupons = await db.query.coupons.findMany({
      where: and(
        eq(coupons.active, true),
        lte(coupons.validFrom, new Date()),
        gte(coupons.validUntil, new Date())
      ),
    });

    return c.json({
      success: true,
      data: availableCoupons,
    });
  } catch (error: any) {
    logError('Get available coupons error', error);
    return c.json({
      error: 'Failed to get available coupons',
      message: error.message,
    }, 500);
  }
});

// Admin: Create coupon
app.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const couponData = await c.req.json();

    const newCoupon = await db.insert(coupons)
      .values({
        ...couponData,
        code: couponData.code.toUpperCase(),
      })
      .returning();

    logInfo('Coupon created', { couponId: newCoupon[0].id });

    return c.json({
      success: true,
      data: newCoupon[0],
    });
  } catch (error: any) {
    logError('Create coupon error', error);
    return c.json({
      error: 'Failed to create coupon',
      message: error.message,
    }, 500);
  }
});

export { app as couponsRoutes };
