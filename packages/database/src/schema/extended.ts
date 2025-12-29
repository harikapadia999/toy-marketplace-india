import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { toys } from './toys';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // order, message, listing, review, system
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data'), // Additional data
  read: boolean('read').default(false),
  actionUrl: text('action_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  query: jsonb('query').notNull(), // Search parameters
  notifyOnNew: boolean('notify_on_new').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const toyViews = pgTable('toy_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  toyId: uuid('toy_id').notNull().references(() => toys.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  viewedAt: timestamp('viewed_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterId: uuid('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportedType: text('reported_type').notNull(), // toy, user, review
  reportedId: uuid('reported_id').notNull(),
  reason: text('reason').notNull(),
  description: text('description'),
  status: text('status').default('pending'), // pending, reviewed, resolved, rejected
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // percentage, fixed
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const couponUsage = pgTable('coupon_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  couponId: uuid('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp('used_at').defaultNow(),
});

export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerId: uuid('referrer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredId: uuid('referred_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),
  status: text('status').default('pending'), // pending, completed, rewarded
  rewardAmount: decimal('reward_amount', { precision: 10, scale: 2 }),
  rewardedAt: timestamp('rewarded_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull(), // basic, premium, seller
  status: text('status').default('active'), // active, cancelled, expired
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  autoRenew: boolean('auto_renew').default(true),
  paymentMethod: text('payment_method'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, {
    fields: [savedSearches.userId],
    references: [users.id],
  }),
}));

export const toyViewsRelations = relations(toyViews, ({ one }) => ({
  toy: one(toys, {
    fields: [toyViews.toyId],
    references: [toys.id],
  }),
  user: one(users, {
    fields: [toyViews.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
  }),
}));

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsage.couponId],
    references: [coupons.id],
  }),
  user: one(users, {
    fields: [couponUsage.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
