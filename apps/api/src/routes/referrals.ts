import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { referrals, users } from '@toy-marketplace/database';
import { eq, and } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';
import crypto from 'crypto';

const app = new Hono();

// Generate referral code
const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Get user's referral code
app.get('/my-code', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Check if user already has a referral code
    let referral = await db.query.referrals.findFirst({
      where: eq(referrals.referrerId, user.id),
    });

    if (!referral) {
      // Create new referral code
      const code = generateReferralCode();
      const newReferral = await db.insert(referrals)
        .values({
          referrerId: user.id,
          code,
        })
        .returning();
      
      referral = newReferral[0];
    }

    return c.json({
      success: true,
      data: {
        code: referral.code,
        referralLink: `${process.env.FRONTEND_URL}/register?ref=${referral.code}`,
      },
    });
  } catch (error: any) {
    logError('Get referral code error', error);
    return c.json({
      error: 'Failed to get referral code',
      message: error.message,
    }, 500);
  }
});

// Get referral stats
app.get('/stats', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const referralStats = await db.query.referrals.findMany({
      where: eq(referrals.referrerId, user.id),
      with: {
        referred: {
          columns: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    const totalReferrals = referralStats.length;
    const completedReferrals = referralStats.filter(r => r.status === 'completed').length;
    const totalRewards = referralStats
      .filter(r => r.rewardAmount)
      .reduce((sum, r) => sum + parseFloat(r.rewardAmount), 0);

    return c.json({
      success: true,
      data: {
        totalReferrals,
        completedReferrals,
        pendingReferrals: totalReferrals - completedReferrals,
        totalRewards,
        referrals: referralStats,
      },
    });
  } catch (error: any) {
    logError('Get referral stats error', error);
    return c.json({
      error: 'Failed to get referral stats',
      message: error.message,
    }, 500);
  }
});

// Apply referral code during registration
app.post('/apply', async (c) => {
  try {
    const { code, newUserId } = await c.req.json();

    // Find referral by code
    const referral = await db.query.referrals.findFirst({
      where: eq(referrals.code, code.toUpperCase()),
    });

    if (!referral) {
      return c.json({
        success: false,
        error: 'Invalid referral code',
      }, 400);
    }

    // Create new referral record
    await db.insert(referrals).values({
      referrerId: referral.referrerId,
      referredId: newUserId,
      code: referral.code,
      status: 'pending',
    });

    logInfo('Referral applied', { code, newUserId });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Apply referral error', error);
    return c.json({
      error: 'Failed to apply referral',
      message: error.message,
    }, 500);
  }
});

// Complete referral (called after first purchase)
app.post('/complete', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { referralId, rewardAmount } = await c.req.json();

    await db.update(referrals)
      .set({
        status: 'completed',
        rewardAmount,
        rewardedAt: new Date(),
      })
      .where(eq(referrals.id, referralId));

    logInfo('Referral completed', { referralId, userId: user.id });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Complete referral error', error);
    return c.json({
      error: 'Failed to complete referral',
      message: error.message,
    }, 500);
  }
});

export { app as referralsRoutes };
