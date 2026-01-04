import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '@toy-marketplace/database/client';
import { users } from '@toy-marketplace/database';
import { eq } from 'drizzle-orm';
import { logInfo, logError } from '../lib/logger';
import bcrypt from 'bcryptjs';

const app = new Hono();

// Get user settings
app.get('/settings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const userSettings = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        language: true,
        currency: true,
        timezone: true,
      },
    });

    return c.json({
      success: true,
      data: userSettings,
    });
  } catch (error: any) {
    logError('Get settings error', error);
    return c.json({
      error: 'Failed to get settings',
      message: error.message,
    }, 500);
  }
});

// Update user settings
app.patch('/settings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const updates = await c.req.json();

    await db.update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    logInfo('Settings updated', { userId: user.id });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Update settings error', error);
    return c.json({
      error: 'Failed to update settings',
      message: error.message,
    }, 500);
  }
});

// Change password
app.post('/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();

    // Get user with password
    const userWithPassword = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!userWithPassword) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userWithPassword.password);
    if (!isValid) {
      return c.json({ error: 'Current password is incorrect' }, 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    logInfo('Password changed', { userId: user.id });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Change password error', error);
    return c.json({
      error: 'Failed to change password',
      message: error.message,
    }, 500);
  }
});

// Update notification preferences
app.patch('/notifications/preferences', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { emailNotifications, smsNotifications, pushNotifications } = await c.req.json();

    await db.update(users)
      .set({
        emailNotifications,
        smsNotifications,
        pushNotifications,
      })
      .where(eq(users.id, user.id));

    logInfo('Notification preferences updated', { userId: user.id });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Update notification preferences error', error);
    return c.json({
      error: 'Failed to update notification preferences',
      message: error.message,
    }, 500);
  }
});

// Update privacy settings
app.patch('/privacy', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { showEmail, showPhone, showOnlineStatus } = await c.req.json();

    await db.update(users)
      .set({
        showEmail,
        showPhone,
        showOnlineStatus,
      })
      .where(eq(users.id, user.id));

    logInfo('Privacy settings updated', { userId: user.id });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Update privacy settings error', error);
    return c.json({
      error: 'Failed to update privacy settings',
      message: error.message,
    }, 500);
  }
});

// Deactivate account
app.post('/deactivate', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { reason } = await c.req.json();

    await db.update(users)
      .set({
        status: 'deactivated',
        deactivatedAt: new Date(),
        deactivationReason: reason,
      })
      .where(eq(users.id, user.id));

    logInfo('Account deactivated', { userId: user.id, reason });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Deactivate account error', error);
    return c.json({
      error: 'Failed to deactivate account',
      message: error.message,
    }, 500);
  }
});

// Reactivate account
app.post('/reactivate', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    await db.update(users)
      .set({
        status: 'active',
        deactivatedAt: null,
        deactivationReason: null,
      })
      .where(eq(users.id, user.id));

    logInfo('Account reactivated', { userId: user.id });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Reactivate account error', error);
    return c.json({
      error: 'Failed to reactivate account',
      message: error.message,
    }, 500);
  }
});

// Request data export
app.post('/export-data', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Get all user data
    const userData = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        toys: true,
        orders: true,
        reviews: true,
        wishlist: true,
        addresses: true,
      },
    });

    logInfo('Data export requested', { userId: user.id });

    return c.json({
      success: true,
      data: userData,
    });
  } catch (error: any) {
    logError('Export data error', error);
    return c.json({
      error: 'Failed to export data',
      message: error.message,
    }, 500);
  }
});

// Delete account permanently
app.delete('/delete-account', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { password, confirmation } = await c.req.json();

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return c.json({
        error: 'Please type "DELETE MY ACCOUNT" to confirm',
      }, 400);
    }

    // Verify password
    const userWithPassword = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!userWithPassword) {
      return c.json({ error: 'User not found' }, 404);
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password);
    if (!isValid) {
      return c.json({ error: 'Password is incorrect' }, 400);
    }

    // Soft delete (mark as deleted but keep data for legal reasons)
    await db.update(users)
      .set({
        status: 'deleted',
        deletedAt: new Date(),
        email: `deleted_${user.id}@deleted.com`,
        phone: null,
      })
      .where(eq(users.id, user.id));

    logInfo('Account deleted', { userId: user.id });

    return c.json({ success: true });
  } catch (error: any) {
    logError('Delete account error', error);
    return c.json({
      error: 'Failed to delete account',
      message: error.message,
    }, 500);
  }
});

export { app as settingsRoutes };
