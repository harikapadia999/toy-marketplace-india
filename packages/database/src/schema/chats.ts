import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const chats = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  user1Id: uuid('user1_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  user2Id: uuid('user2_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  user1Idx: index('chats_user1_idx').on(table.user1Id),
  user2Idx: index('chats_user2_idx').on(table.user2Id),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user1: one(users, {
    fields: [chats.user1Id],
    references: [users.id],
    relationName: 'user1Chats',
  }),
  user2: one(users, {
    fields: [chats.user2Id],
    references: [users.id],
    relationName: 'user2Chats',
  }),
  messages: many(messages),
}));

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: text('type', { enum: ['text', 'image'] }).default('text').notNull(),
  isRead: text('is_read').default('false').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  chatIdx: index('messages_chat_idx').on(table.chatId),
  senderIdx: index('messages_sender_idx').on(table.senderId),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
