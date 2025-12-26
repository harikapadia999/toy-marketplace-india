import { pgTable, timestamp, uuid, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { toys } from './toys';

export const wishlist = pgTable('wishlist', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toyId: uuid('toy_id').notNull().references(() => toys.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.toyId] }),
  userIdx: index('wishlist_user_idx').on(table.userId),
  toyIdx: index('wishlist_toy_idx').on(table.toyId),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id],
  }),
  toy: one(toys, {
    fields: [wishlist.toyId],
    references: [toys.id],
  }),
}));

export type Wishlist = typeof wishlist.$inferSelect;
export type NewWishlist = typeof wishlist.$inferInsert;
