import { pgTable, uuid, integer, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { transactions } from './transactions';

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // References
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  revieweeId: uuid('reviewee_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Rating (1-5 stars)
  rating: integer('rating').notNull(), // 1, 2, 3, 4, 5
  
  // Detailed Ratings
  communicationRating: integer('communication_rating'), // 1-5
  productQualityRating: integer('product_quality_rating'), // 1-5
  deliveryRating: integer('delivery_rating'), // 1-5
  valueForMoneyRating: integer('value_for_money_rating'), // 1-5
  
  // Review Content
  title: varchar('title', { length: 200 }),
  comment: text('comment'),
  
  // Media
  images: text('images')[],
  
  // Helpful Votes
  helpfulCount: integer('helpful_count').default(0),
  notHelpfulCount: integer('not_helpful_count').default(0),
  
  // Verification
  isVerifiedPurchase: boolean('is_verified_purchase').default(true),
  
  // Response
  sellerResponse: text('seller_response'),
  sellerRespondedAt: timestamp('seller_responded_at'),
  
  // Moderation
  isReported: boolean('is_reported').default(false),
  isHidden: boolean('is_hidden').default(false),
  moderationNotes: text('moderation_notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  transaction: one(transactions, {
    fields: [reviews.transactionId],
    references: [transactions.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: 'reviewer',
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: 'reviewee',
  }),
}));

// Types
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
