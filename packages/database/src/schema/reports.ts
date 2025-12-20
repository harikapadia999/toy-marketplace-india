import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { listings } from './listings';

// Enums
export const reportTypeEnum = pgEnum('report_type', [
  'listing',
  'user',
  'message',
  'review'
]);

export const reportReasonEnum = pgEnum('report_reason', [
  'spam',
  'fraud',
  'inappropriate_content',
  'counterfeit',
  'safety_concern',
  'harassment',
  'misleading_info',
  'prohibited_item',
  'other'
]);

export const reportStatusEnum = pgEnum('report_status', [
  'pending',
  'under_review',
  'resolved',
  'dismissed'
]);

// Reports table
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Reporter
  reporterId: uuid('reporter_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Reported Entity
  type: reportTypeEnum('type').notNull(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }),
  reportedUserId: uuid('reported_user_id').references(() => users.id, { onDelete: 'cascade' }),
  messageId: uuid('message_id'),
  reviewId: uuid('review_id'),
  
  // Report Details
  reason: reportReasonEnum('reason').notNull(),
  description: text('description').notNull(),
  
  // Evidence
  screenshots: text('screenshots')[],
  
  // Status
  status: reportStatusEnum('status').default('pending').notNull(),
  
  // Moderation
  moderatorId: uuid('moderator_id').references(() => users.id),
  moderatorNotes: text('moderator_notes'),
  actionTaken: varchar('action_taken', { length: 100 }),
  
  // Resolution
  resolvedAt: timestamp('resolved_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: 'reporter',
  }),
  reportedUser: one(users, {
    fields: [reports.reportedUserId],
    references: [users.id],
    relationName: 'reportedUser',
  }),
  listing: one(listings, {
    fields: [reports.listingId],
    references: [listings.id],
  }),
  moderator: one(users, {
    fields: [reports.moderatorId],
    references: [users.id],
    relationName: 'moderator',
  }),
}));

// Types
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
