import { pgTable, uuid, text, timestamp, boolean, varchar, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { listings } from './listings';

// Enums
export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'video', 'audio', 'file', 'offer', 'system']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read', 'failed']);

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Participants
  buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'cascade' }),
  
  // Status
  isActive: boolean('is_active').default(true),
  isBlocked: boolean('is_blocked').default(false),
  blockedBy: uuid('blocked_by').references(() => users.id),
  
  // Last Message
  lastMessageAt: timestamp('last_message_at'),
  lastMessagePreview: text('last_message_preview'),
  
  // Unread Counts
  buyerUnreadCount: integer('buyer_unread_count').default(0),
  sellerUnreadCount: integer('seller_unread_count').default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // References
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: uuid('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Message Content
  type: messageTypeEnum('type').default('text').notNull(),
  content: text('content').notNull(),
  
  // Media
  media: jsonb('media').$type<{
    url: string;
    thumbnail?: string;
    filename?: string;
    size?: number;
    mimeType?: string;
    duration?: number; // for audio/video
  }[]>(),
  
  // Offer (for price negotiation)
  offerAmount: decimal('offer_amount', { precision: 10, scale: 2 }),
  offerStatus: varchar('offer_status', { length: 20 }), // pending, accepted, rejected, countered
  
  // Status
  status: messageStatusEnum('status').default('sent').notNull(),
  
  // Read Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  
  // Delivery
  deliveredAt: timestamp('delivered_at'),
  
  // Moderation
  isReported: boolean('is_reported').default(false),
  isDeleted: boolean('is_deleted').default(false),
  deletedBy: uuid('deleted_by').references(() => users.id),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  buyer: one(users, {
    fields: [conversations.buyerId],
    references: [users.id],
    relationName: 'buyer',
  }),
  seller: one(users, {
    fields: [conversations.sellerId],
    references: [users.id],
    relationName: 'seller',
  }),
  listing: one(listings, {
    fields: [conversations.listingId],
    references: [listings.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
}));

// Types
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
