import { pgTable, uuid, varchar, text, decimal, timestamp, boolean, jsonb, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

// Enums
export const listingStatusEnum = pgEnum('listing_status', ['draft', 'active', 'sold', 'reserved', 'expired', 'deleted']);
export const toyConditionEnum = pgEnum('toy_condition', ['new', 'like_new', 'excellent', 'good', 'fair', 'poor']);
export const toyCategoryEnum = pgEnum('toy_category', [
  'action_figures',
  'dolls',
  'educational',
  'electronic',
  'outdoor',
  'board_games',
  'puzzles',
  'building_blocks',
  'vehicles',
  'soft_toys',
  'musical',
  'arts_crafts',
  'sports',
  'pretend_play',
  'baby_toys',
  'other'
]);

// Listings table
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Seller
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Basic Info
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: toyCategoryEnum('category').notNull(),
  subCategory: varchar('sub_category', { length: 100 }),
  
  // Brand & Model
  brand: varchar('brand', { length: 100 }),
  modelNumber: varchar('model_number', { length: 100 }),
  manufacturer: varchar('manufacturer', { length: 100 }),
  
  // Condition
  condition: toyConditionEnum('condition').notNull(),
  conditionNotes: text('condition_notes'),
  
  // Age Range
  minAge: integer('min_age'), // in months
  maxAge: integer('max_age'), // in months
  ageRange: varchar('age_range', { length: 50 }), // e.g., "3-5 years"
  
  // Pricing
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).notNull(),
  negotiable: boolean('negotiable').default(true),
  
  // Purchase Info
  purchaseDate: timestamp('purchase_date'),
  purchaseLocation: varchar('purchase_location', { length: 200 }),
  
  // Images & Media
  images: jsonb('images').$type<{
    url: string;
    thumbnail: string;
    alt?: string;
    order: number;
  }[]>().notNull(),
  videos: jsonb('videos').$type<{
    url: string;
    thumbnail: string;
    duration?: number;
  }[]>(),
  
  // Safety & Certifications
  certifications: jsonb('certifications').$type<{
    name: string;
    number?: string;
    issuedBy?: string;
    validUntil?: string;
  }[]>(),
  safetyWarnings: text('safety_warnings'),
  recallStatus: boolean('recall_status').default(false),
  
  // Specifications
  specifications: jsonb('specifications').$type<{
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: string;
    };
    weight?: {
      value?: number;
      unit?: string;
    };
    material?: string[];
    color?: string[];
    batteryRequired?: boolean;
    batteryIncluded?: boolean;
    assemblyRequired?: boolean;
    numberOfPieces?: number;
  }>(),
  
  // Accessories & Packaging
  includedAccessories: text('included_accessories')[],
  missingParts: text('missing_parts')[],
  hasOriginalBox: boolean('has_original_box').default(false),
  hasManual: boolean('has_manual').default(false),
  hasWarranty: boolean('has_warranty').default(false),
  warrantyDetails: text('warranty_details'),
  
  // Location
  location: jsonb('location').$type<{
    city: string;
    state: string;
    pincode: string;
    locality?: string;
    latitude?: number;
    longitude?: number;
  }>().notNull(),
  
  // Shipping
  shippingAvailable: boolean('shipping_available').default(true),
  localPickupAvailable: boolean('local_pickup_available').default(true),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }),
  freeShipping: boolean('free_shipping').default(false),
  
  // Status & Visibility
  status: listingStatusEnum('status').default('draft').notNull(),
  isPromoted: boolean('is_promoted').default(false),
  isFeatured: boolean('is_featured').default(false),
  
  // Stats
  views: integer('views').default(0),
  favorites: integer('favorites').default(0),
  inquiries: integer('inquiries').default(0),
  
  // SEO
  slug: varchar('slug', { length: 255 }).unique(),
  metaTitle: varchar('meta_title', { length: 200 }),
  metaDescription: text('meta_description'),
  tags: text('tags')[],
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  soldAt: timestamp('sold_at'),
  expiresAt: timestamp('expires_at'),
  deletedAt: timestamp('deleted_at'),
});

// Relations
export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
  transactions: many('transactions'),
  wishlists: many('wishlists'),
  messages: many('messages'),
  reports: many('reports'),
}));

// Types
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
