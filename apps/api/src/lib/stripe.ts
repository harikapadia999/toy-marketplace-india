import Stripe from 'stripe';
import { logInfo, logError } from './logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Create payment intent
export const createStripePaymentIntent = async (
  amount: number,
  currency: string = 'inr',
  metadata?: any
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logInfo('Stripe payment intent created', {
      paymentIntentId: paymentIntent.id,
      amount,
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    };
  } catch (error: any) {
    logError('Create Stripe payment intent error', error);
    return { success: false, error: error.message };
  }
};

// Confirm payment
export const confirmStripePayment = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    logInfo('Stripe payment confirmed', {
      paymentIntentId,
      status: paymentIntent.status,
    });

    return {
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
      },
    };
  } catch (error: any) {
    logError('Confirm Stripe payment error', error);
    return { success: false, error: error.message };
  }
};

// Create refund
export const createStripeRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: string
) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as any,
    });

    logInfo('Stripe refund created', {
      refundId: refund.id,
      amount: refund.amount / 100,
    });

    return {
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    };
  } catch (error: any) {
    logError('Create Stripe refund error', error);
    return { success: false, error: error.message };
  }
};

// Create customer
export const createStripeCustomer = async (
  email: string,
  name: string,
  metadata?: any
) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    logInfo('Stripe customer created', { customerId: customer.id });

    return {
      success: true,
      data: {
        customerId: customer.id,
      },
    };
  } catch (error: any) {
    logError('Create Stripe customer error', error);
    return { success: false, error: error.message };
  }
};

// Create subscription
export const createStripeSubscription = async (
  customerId: string,
  priceId: string
) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    logInfo('Stripe subscription created', {
      subscriptionId: subscription.id,
    });

    return {
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      },
    };
  } catch (error: any) {
    logError('Create Stripe subscription error', error);
    return { success: false, error: error.message };
  }
};

// Cancel subscription
export const cancelStripeSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    logInfo('Stripe subscription cancelled', { subscriptionId });

    return {
      success: true,
      data: {
        status: subscription.status,
      },
    };
  } catch (error: any) {
    logError('Cancel Stripe subscription error', error);
    return { success: false, error: error.message };
  }
};

// Webhook handler
export const handleStripeWebhook = async (
  payload: string | Buffer,
  signature: string
) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    logInfo('Stripe webhook received', { type: event.type });

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Handle successful payment
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        // Handle failed payment
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        // Handle subscription created
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        // Handle subscription cancelled
        break;

      default:
        logInfo('Unhandled Stripe webhook event', { type: event.type });
    }

    return { success: true, event };
  } catch (error: any) {
    logError('Handle Stripe webhook error', error);
    return { success: false, error: error.message };
  }
};
