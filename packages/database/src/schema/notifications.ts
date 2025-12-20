import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// Enums
export const notificationTypeEnum = pgEnum('notification_type', [
  'new_message',
  'new_offer',
  'offer_accepted',
  'offer_rejected',
  'listing_sold',
  'payment_received',
  'item_shipped',
  'item_delivered',
  'review_received',
  'price_drop',
  'wishlist_available',
  'account_verified',
  'system_alert'
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'in_app',
  'email',
  'sms',
  'whatsapp',
  'push'
]);

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // References
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Notification Details
  type: notificationTypeEnum('type').notNull(),
  channel: notificationChannelEnum('channel').default('in_app').notNull(),
  
  // Content
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  
  // Action
  actionUrl: text('action_url'),
  actionText: varchar('action_text', { length: 100 }),
  
  // Metadata
  metadata: jsonb('metadata').$type<{
    listingId?: string;
    transactionId?: string;
    messageId?: string;
    reviewId?: string;
    [key: string]: any;
  }>(),
  
  // Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  
  // Delivery Status
  isSent: boolean('is_sent').default(false),
  sentAt: timestamp('sent_at'),
  deliveryStatus: varchar('delivery_status', { length: 50 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
