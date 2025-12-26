import { pgTable, text, integer, timestamp, boolean, decimal, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users';

export const toys = pgTable('toys', {
  id: uuid('id').defaultRandom().primaryKey(),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  brand: text('brand').notNull(),
  category: text('category').notNull(),
  subCategory: text('sub_category'),
  condition: text('condition', { enum: ['new', 'like_new', 'good', 'fair'] }).notNull(),
  ageRange: text('age_range').notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
  images: jsonb('images').$type<string[]>().notNull(),
  tags: jsonb('tags').$type<string[]>(),
  specifications: jsonb('specifications').$type<Record<string, any>>(),
  location: jsonb('location').$type<{
    city: string;
    state: string;
    pinCode: string;
    latitude?: number;
    longitude?: number;
  }>().notNull(),
  status: text('status', { enum: ['active', 'sold', 'inactive', 'pending'] }).default('active').notNull(),
  views: integer('views').default(0).notNull(),
  favorites: integer('favorites').default(0).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  soldAt: timestamp('sold_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  sellerIdx: index('toys_seller_idx').on(table.sellerId),
  categoryIdx: index('toys_category_idx').on(table.category),
  statusIdx: index('toys_status_idx').on(table.status),
  locationIdx: index('toys_location_idx').on(table.location),
}));

export const toysRelations = relations(toys, ({ one, many }) => ({
  seller: one(users, {
    fields: [toys.sellerId],
    references: [users.id],
  }),
  reviews: many(reviews),
  orders: many(orders),
}));

// Insert & Select Schemas
export const insertToySchema = createInsertSchema(toys, {
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  brand: z.string().min(2).max(100),
  category: z.string(),
  condition: z.enum(['new', 'like_new', 'good', 'fair']),
  ageRange: z.string(),
  originalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  salePrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  images: z.array(z.string().url()).min(1).max(10),
});

export const selectToySchema = createSelectSchema(toys);

export type Toy = typeof toys.$inferSelect;
export type NewToy = typeof toys.$inferInsert;
