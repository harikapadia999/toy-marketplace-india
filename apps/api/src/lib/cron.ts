import cron from 'node-cron';
import { db } from '@toy-marketplace/database/client';
import { orders, toys, users, subscriptions } from '@toy-marketplace/database';
import { eq, lt, and } from 'drizzle-orm';
import { logInfo, logError } from './logger';
import { sendEmail } from './email';
import { sendSMS } from './sms';

// Auto-complete delivered orders after 7 days
cron.schedule('0 0 * * *', async () => {
  try {
    logInfo('Running auto-complete orders job');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ordersToComplete = await db.query.orders.findMany({
      where: and(
        eq(orders.status, 'delivered'),
        lt(orders.deliveredAt, sevenDaysAgo)
      ),
    });

    for (const order of ordersToComplete) {
      await db.update(orders)
        .set({ status: 'completed' })
        .where(eq(orders.id, order.id));

      logInfo('Order auto-completed', { orderId: order.id });
    }

    logInfo('Auto-complete orders job completed', {
      count: ordersToComplete.length,
    });
  } catch (error) {
    logError('Auto-complete orders job failed', error);
  }
});

// Send review reminders for completed orders
cron.schedule('0 10 * * *', async () => {
  try {
    logInfo('Running review reminder job');

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const ordersNeedingReview = await db.query.orders.findMany({
      where: and(
        eq(orders.status, 'completed'),
        lt(orders.completedAt, threeDaysAgo)
      ),
      with: {
        buyer: true,
        toy: true,
      },
    });

    for (const order of ordersNeedingReview) {
      // Check if review already exists
      const existingReview = await db.query.reviews.findFirst({
        where: and(
          eq(reviews.orderId, order.id),
          eq(reviews.userId, order.buyerId)
        ),
      });

      if (!existingReview) {
        await sendEmail(
          order.buyer.email,
          'reviewReminder',
          {
            name: order.buyer.name,
            toyTitle: order.toy.title,
            orderNumber: order.orderNumber,
          }
        );

        logInfo('Review reminder sent', { orderId: order.id });
      }
    }

    logInfo('Review reminder job completed');
  } catch (error) {
    logError('Review reminder job failed', error);
  }
});

// Expire inactive listings after 90 days
cron.schedule('0 2 * * *', async () => {
  try {
    logInfo('Running expire listings job');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const expiredListings = await db.update(toys)
      .set({ status: 'expired' })
      .where(and(
        eq(toys.status, 'active'),
        lt(toys.updatedAt, ninetyDaysAgo)
      ))
      .returning();

    logInfo('Expire listings job completed', {
      count: expiredListings.length,
    });
  } catch (error) {
    logError('Expire listings job failed', error);
  }
});

// Send subscription renewal reminders
cron.schedule('0 9 * * *', async () => {
  try {
    logInfo('Running subscription renewal reminder job');

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringSubscriptions = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.status, 'active'),
        lt(subscriptions.endDate, threeDaysFromNow)
      ),
      with: {
        user: true,
      },
    });

    for (const subscription of expiringSubscriptions) {
      await sendEmail(
        subscription.user.email,
        'subscriptionRenewal',
        {
          name: subscription.user.name,
          plan: subscription.plan,
          endDate: subscription.endDate,
        }
      );

      logInfo('Subscription renewal reminder sent', {
        subscriptionId: subscription.id,
      });
    }

    logInfo('Subscription renewal reminder job completed');
  } catch (error) {
    logError('Subscription renewal reminder job failed', error);
  }
});

// Clean up old notifications
cron.schedule('0 3 * * 0', async () => {
  try {
    logInfo('Running cleanup notifications job');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedCount = await db.delete(notifications)
      .where(and(
        eq(notifications.read, true),
        lt(notifications.createdAt, thirtyDaysAgo)
      ));

    logInfo('Cleanup notifications job completed', { deletedCount });
  } catch (error) {
    logError('Cleanup notifications job failed', error);
  }
});

// Generate daily reports
cron.schedule('0 23 * * *', async () => {
  try {
    logInfo('Running daily report generation job');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's stats
    const [newUsers] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, today));

    const [newOrders] = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, today));

    const [newListings] = await db.select({ count: sql<number>`count(*)` })
      .from(toys)
      .where(gte(toys.createdAt, today));

    const [todayRevenue] = await db.select({ 
      sum: sql<number>`sum(${orders.totalAmount})` 
    })
      .from(orders)
      .where(and(
        gte(orders.createdAt, today),
        eq(orders.status, 'delivered')
      ));

    const report = {
      date: today.toISOString().split('T')[0],
      newUsers: newUsers.count,
      newOrders: newOrders.count,
      newListings: newListings.count,
      revenue: todayRevenue.sum || 0,
    };

    // Send report to admin
    await sendEmail(
      process.env.ADMIN_EMAIL!,
      'dailyReport',
      report
    );

    logInfo('Daily report generated', report);
  } catch (error) {
    logError('Daily report generation job failed', error);
  }
});

// Backup database (weekly)
cron.schedule('0 4 * * 0', async () => {
  try {
    logInfo('Running database backup job');

    // Implement database backup logic here
    // This could involve pg_dump or similar tools

    logInfo('Database backup job completed');
  } catch (error) {
    logError('Database backup job failed', error);
  }
});

// Health check for cron jobs
export const getCronJobsStatus = () => {
  return {
    autoCompleteOrders: '0 0 * * * (Daily at midnight)',
    reviewReminders: '0 10 * * * (Daily at 10 AM)',
    expireListings: '0 2 * * * (Daily at 2 AM)',
    subscriptionReminders: '0 9 * * * (Daily at 9 AM)',
    cleanupNotifications: '0 3 * * 0 (Weekly on Sunday at 3 AM)',
    dailyReports: '0 23 * * * (Daily at 11 PM)',
    databaseBackup: '0 4 * * 0 (Weekly on Sunday at 4 AM)',
  };
};

logInfo('Cron jobs initialized', getCronJobsStatus());
