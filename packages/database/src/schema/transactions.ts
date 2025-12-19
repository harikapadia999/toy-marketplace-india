import { pgTable, uuid, decimal, timestamp, varchar, text, jsonb, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { listings } from './listings';

// Enums
export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'payment_pending',
  'payment_completed',
  'processing',
  'shipped',
  'in_transit',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
  'disputed'
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'upi',
  'card',
  'netbanking',
  'wallet',
  'cod',
  'emi'
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partially_refunded'
]);

export const shippingMethodEnum = pgEnum('shipping_method', [
  'standard',
  'express',
  'same_day',
  'local_pickup',
  'courier'
]);

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // References
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'restrict' }).notNull(),
  buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  
  // Transaction Details
  status: transactionStatusEnum('status').default('pending').notNull(),
  
  // Pricing
  itemPrice: decimal('item_price', { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0.00'),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0.00'),
  platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).default('0.00'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  
  // Payment
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
  paymentId: varchar('payment_id', { length: 255 }),
  paymentGateway: varchar('payment_gateway', { length: 50 }), // razorpay, cashfree, etc.
  paymentDetails: jsonb('payment_details').$type<{
    orderId?: string;
    transactionId?: string;
    upiId?: string;
    cardLast4?: string;
    cardBrand?: string;
    walletName?: string;
    bankName?: string;
    emiTenure?: number;
    emiAmount?: number;
  }>(),
  
  // Escrow
  escrowHeld: boolean('escrow_held').default(false),
  escrowReleasedAt: timestamp('escrow_released_at'),
  
  // Shipping
  shippingMethod: shippingMethodEnum('shipping_method'),
  shippingAddress: jsonb('shipping_address').$type<{
    name: string;
    phone: string;
    street: string;
    locality?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark?: string;
  }>(),
  
  // Tracking
  trackingNumber: varchar('tracking_number', { length: 100 }),
  courierName: varchar('courier_name', { length: 100 }),
  trackingUrl: text('tracking_url'),
  estimatedDelivery: timestamp('estimated_delivery'),
  
  // Delivery
  deliveredAt: timestamp('delivered_at'),
  deliveryProof: jsonb('delivery_proof').$type<{
    signature?: string;
    photo?: string;
    otp?: string;
    receivedBy?: string;
  }>(),
  
  // Buyer & Seller Notes
  buyerNotes: text('buyer_notes'),
  sellerNotes: text('seller_notes'),
  
  // Cancellation & Refund
  cancellationReason: text('cancellation_reason'),
  cancelledBy: uuid('cancelled_by').references(() => users.id),
  cancelledAt: timestamp('cancelled_at'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  refundedAt: timestamp('refunded_at'),
  
  // Dispute
  disputeReason: text('dispute_reason'),
  disputeStatus: varchar('dispute_status', { length: 50 }),
  disputeResolvedAt: timestamp('dispute_resolved_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Relations
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  listing: one(listings, {
    fields: [transactions.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
    relationName: 'buyer',
  }),
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id],
    relationName: 'seller',
  }),
  reviews: many('reviews'),
}));

// Types
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
