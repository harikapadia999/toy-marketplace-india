import { pgTable, uuid, varchar, text, boolean, timestamp, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'both', 'admin']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Authentication
  email: varchar('email', { length: 255 }).unique(),
  emailVerified: boolean('email_verified').default(false),
  phone: varchar('phone', { length: 15 }).unique(),
  phoneVerified: boolean('phone_verified').default(false),
  passwordHash: text('password_hash'),
  
  // Profile
  name: varchar('name', { length: 100 }).notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  
  // Role & Status
  role: userRoleEnum('role').default('buyer').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isBanned: boolean('is_banned').default(false).notNull(),
  
  // Verification
  aadhaarNumber: varchar('aadhaar_number', { length: 12 }),
  aadhaarVerified: boolean('aadhaar_verified').default(false),
  aadhaarVerificationStatus: verificationStatusEnum('aadhaar_verification_status').default('pending'),
  panNumber: varchar('pan_number', { length: 10 }),
  panVerified: boolean('pan_verified').default(false),
  
  // Location
  address: jsonb('address').$type<{
    street?: string;
    locality?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  }>(),
  
  // Ratings & Stats
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalRatings: decimal('total_ratings', { precision: 10, scale: 0 }).default('0'),
  totalSales: decimal('total_sales', { precision: 10, scale: 0 }).default('0'),
  totalPurchases: decimal('total_purchases', { precision: 10, scale: 0 }).default('0'),
  
  // Preferences
  preferences: jsonb('preferences').$type<{
    language?: string;
    currency?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      whatsapp?: boolean;
      push?: boolean;
    };
    privacy?: {
      showPhone?: boolean;
      showEmail?: boolean;
      showLocation?: boolean;
    };
  }>(),
  
  // Social Login
  googleId: varchar('google_id', { length: 255 }),
  facebookId: varchar('facebook_id', { length: 255 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  deletedAt: timestamp('deleted_at'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many('listings'),
  purchases: many('transactions', { relationName: 'buyer' }),
  sales: many('transactions', { relationName: 'seller' }),
  reviews: many('reviews', { relationName: 'reviewer' }),
  receivedReviews: many('reviews', { relationName: 'reviewee' }),
  messages: many('messages'),
  wishlists: many('wishlists'),
  notifications: many('notifications'),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
