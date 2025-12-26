import { pgTable, text, integer, timestamp, decimal, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users';
import { toys } from './toys';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  buyerId: uuid('buyer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toyId: uuid('toy_id').notNull().references(() => toys.id, { onDelete: 'cascade' }),
  orderNumber: text('order_number').notNull().unique(),
  status: text('status', { 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] 
  }).default('pending').notNull(),
  paymentStatus: text('payment_status', { 
    enum: ['pending', 'paid', 'failed', 'refunded'] 
  }).default('pending').notNull(),
  paymentMethod: text('payment_method', { 
    enum: ['upi', 'card', 'wallet', 'netbanking', 'cod'] 
  }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 }).default('0').notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb('shipping_address').$type<{
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pinCode: string;
    landmark?: string;
  }>().notNull(),
  trackingNumber: text('tracking_number'),
  trackingUrl: text('tracking_url'),
  shippingProvider: text('shipping_provider'),
  estimatedDelivery: timestamp('estimated_delivery'),
  deliveredAt: timestamp('delivered_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  buyerIdx: index('orders_buyer_idx').on(table.buyerId),
  sellerIdx: index('orders_seller_idx').on(table.sellerId),
  statusIdx: index('orders_status_idx').on(table.status),
  orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
  }),
  toy: one(toys, {
    fields: [orders.toyId],
    references: [toys.id],
  }),
}));

// Insert & Select Schemas
export const insertOrderSchema = createInsertSchema(orders, {
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  shippingFee: z.string().regex(/^\d+(\.\d{1,2})?$/),
  tax: z.string().regex(/^\d+(\.\d{1,2})?$/),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export const selectOrderSchema = createSelectSchema(orders);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
