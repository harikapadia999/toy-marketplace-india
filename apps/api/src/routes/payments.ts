import { Hono } from 'hono';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { orders, orderItems } from '@toy-marketplace/database';
import { eq } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';

const app = new Hono();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create Razorpay order
app.post('/create-order', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { orderId } = await c.req.json();

    // Get order details
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
      },
    });

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId: user.id,
      },
    });

    // Update order with Razorpay order ID
    await db.update(orders)
      .set({ 
        razorpayOrderId: razorpayOrder.id,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    logInfo('Razorpay order created', {
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
    });

    return c.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    logError('Create Razorpay order error', error);
    return c.json({
      error: 'Failed to create payment order',
      message: error.message,
    }, 500);
  }
});

// Verify payment
app.post('/verify-payment', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await c.req.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logError('Payment signature verification failed', new Error('Invalid signature'), {
        razorpay_order_id,
        razorpay_payment_id,
      });
      return c.json({ error: 'Invalid payment signature' }, 400);
    }

    // Get order by Razorpay order ID
    const order = await db.query.orders.findFirst({
      where: eq(orders.razorpayOrderId, razorpay_order_id),
    });

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update order status
    await db.update(orders)
      .set({
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    logInfo('Payment verified successfully', {
      orderId: order.id,
      razorpay_order_id,
      razorpay_payment_id,
    });

    return c.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error: any) {
    logError('Verify payment error', error);
    return c.json({
      error: 'Failed to verify payment',
      message: error.message,
    }, 500);
  }
});

// Webhook handler
app.post('/webhook', async (c) => {
  try {
    const signature = c.req.header('x-razorpay-signature');
    const body = await c.req.text();

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      logError('Webhook signature verification failed', new Error('Invalid signature'));
      return c.json({ error: 'Invalid signature' }, 400);
    }

    const event = JSON.parse(body);

    logInfo('Razorpay webhook received', {
      event: event.event,
      paymentId: event.payload?.payment?.entity?.id,
    });

    // Handle different events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      default:
        logInfo('Unhandled webhook event', { event: event.event });
    }

    return c.json({ success: true });
  } catch (error: any) {
    logError('Webhook handler error', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Handle payment captured
async function handlePaymentCaptured(payment: any) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.razorpayOrderId, payment.order_id),
    });

    if (order) {
      await db.update(orders)
        .set({
          paymentStatus: 'paid',
          razorpayPaymentId: payment.id,
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      logInfo('Payment captured', {
        orderId: order.id,
        paymentId: payment.id,
        amount: payment.amount / 100,
      });
    }
  } catch (error: any) {
    logError('Handle payment captured error', error);
  }
}

// Handle payment failed
async function handlePaymentFailed(payment: any) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.razorpayOrderId, payment.order_id),
    });

    if (order) {
      await db.update(orders)
        .set({
          paymentStatus: 'failed',
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      logInfo('Payment failed', {
        orderId: order.id,
        paymentId: payment.id,
        errorCode: payment.error_code,
        errorDescription: payment.error_description,
      });
    }
  } catch (error: any) {
    logError('Handle payment failed error', error);
  }
}

// Handle order paid
async function handleOrderPaid(razorpayOrder: any) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.razorpayOrderId, razorpayOrder.id),
    });

    if (order) {
      await db.update(orders)
        .set({
          paymentStatus: 'paid',
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      logInfo('Order paid', {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
      });
    }
  } catch (error: any) {
    logError('Handle order paid error', error);
  }
}

// Get payment details
app.get('/payment/:paymentId', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { paymentId } = c.req.param();

    const payment = await razorpay.payments.fetch(paymentId);

    // Verify user owns this payment
    const order = await db.query.orders.findFirst({
      where: eq(orders.razorpayPaymentId, paymentId),
    });

    if (!order || order.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    logError('Get payment details error', error);
    return c.json({
      error: 'Failed to get payment details',
      message: error.message,
    }, 500);
  }
});

// Refund payment
app.post('/refund', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { orderId, reason } = await c.req.json();

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    if (!order.razorpayPaymentId) {
      return c.json({ error: 'No payment found for this order' }, 400);
    }

    // Create refund
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: order.totalAmount * 100, // Full refund
      notes: {
        orderId: order.id,
        reason,
      },
    });

    // Update order status
    await db.update(orders)
      .set({
        paymentStatus: 'refunded',
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    logInfo('Refund created', {
      orderId,
      refundId: refund.id,
      amount: refund.amount / 100,
    });

    return c.json({
      success: true,
      message: 'Refund initiated successfully',
      data: refund,
    });
  } catch (error: any) {
    logError('Refund error', error);
    return c.json({
      error: 'Failed to process refund',
      message: error.message,
    }, 500);
  }
});

export { app as paymentRoutes };
