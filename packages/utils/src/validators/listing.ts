import { z } from 'zod';

// Toy categories
export const toyCategoryEnum = z.enum([
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
  'other',
]);

// Toy condition
export const toyConditionEnum = z.enum([
  'new',
  'like_new',
  'excellent',
  'good',
  'fair',
  'poor',
]);

// Image schema
export const imageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  alt: z.string().optional(),
  order: z.number().int().min(0),
});

// Video schema
export const videoSchema = z.object({
  url: z.string().url('Invalid video URL'),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  duration: z.number().positive().optional(),
});

// Certification schema
export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  number: z.string().optional(),
  issuedBy: z.string().optional(),
  validUntil: z.string().optional(),
});

// Specifications schema
export const specificationsSchema = z.object({
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'inch']).default('cm'),
  }).optional(),
  weight: z.object({
    value: z.number().positive().optional(),
    unit: z.enum(['kg', 'g', 'lb']).default('kg'),
  }).optional(),
  material: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  batteryRequired: z.boolean().optional(),
  batteryIncluded: z.boolean().optional(),
  assemblyRequired: z.boolean().optional(),
  numberOfPieces: z.number().int().positive().optional(),
});

// Location schema
export const locationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  locality: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Create listing schema
export const createListingSchema = z.object({
  // Basic Info
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  category: toyCategoryEnum,
  subCategory: z.string().max(100).optional(),
  
  // Brand & Model
  brand: z.string().max(100).optional(),
  modelNumber: z.string().max(100).optional(),
  manufacturer: z.string().max(100).optional(),
  
  // Condition
  condition: toyConditionEnum,
  conditionNotes: z.string().max(1000).optional(),
  
  // Age Range
  minAge: z.number().int().min(0).max(216).optional(), // 0-18 years in months
  maxAge: z.number().int().min(0).max(216).optional(),
  ageRange: z.string().max(50).optional(),
  
  // Pricing
  originalPrice: z.number().positive().optional(),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  negotiable: z.boolean().default(true),
  
  // Purchase Info
  purchaseDate: z.string().optional(),
  purchaseLocation: z.string().max(200).optional(),
  
  // Images & Media (minimum 1 image required)
  images: z.array(imageSchema).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  videos: z.array(videoSchema).max(3, 'Maximum 3 videos allowed').optional(),
  
  // Safety & Certifications
  certifications: z.array(certificationSchema).optional(),
  safetyWarnings: z.string().max(1000).optional(),
  
  // Specifications
  specifications: specificationsSchema.optional(),
  
  // Accessories & Packaging
  includedAccessories: z.array(z.string()).optional(),
  missingParts: z.array(z.string()).optional(),
  hasOriginalBox: z.boolean().default(false),
  hasManual: z.boolean().default(false),
  hasWarranty: z.boolean().default(false),
  warrantyDetails: z.string().max(500).optional(),
  
  // Location
  location: locationSchema,
  
  // Shipping
  shippingAvailable: z.boolean().default(true),
  localPickupAvailable: z.boolean().default(true),
  shippingCost: z.number().nonnegative().optional(),
  freeShipping: z.boolean().default(false),
  
  // Tags
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
}).refine(
  (data) => !data.maxAge || !data.minAge || data.maxAge >= data.minAge,
  {
    message: 'Maximum age must be greater than or equal to minimum age',
    path: ['maxAge'],
  }
).refine(
  (data) => !data.originalPrice || !data.sellingPrice || data.sellingPrice <= data.originalPrice,
  {
    message: 'Selling price cannot be greater than original price',
    path: ['sellingPrice'],
  }
);

// Update listing schema (all fields optional)
export const updateListingSchema = createListingSchema.partial();

// Listing filters schema
export const listingFiltersSchema = z.object({
  category: toyCategoryEnum.optional(),
  condition: toyConditionEnum.optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  minAge: z.number().int().nonnegative().optional(),
  maxAge: z.number().int().positive().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  brand: z.string().optional(),
  negotiable: z.boolean().optional(),
  shippingAvailable: z.boolean().optional(),
  localPickupAvailable: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
  hasOriginalBox: z.boolean().optional(),
  hasWarranty: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_low', 'price_high', 'popular']).default('newest'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
}).refine(
  (data) => !data.minPrice || !data.maxPrice || data.maxPrice >= data.minPrice,
  {
    message: 'Maximum price must be greater than or equal to minimum price',
    path: ['maxPrice'],
  }
);

// Export types
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingFiltersInput = z.infer<typeof listingFiltersSchema>;
export type ToyCategory = z.infer<typeof toyCategoryEnum>;
export type ToyCondition = z.infer<typeof toyConditionEnum>;
