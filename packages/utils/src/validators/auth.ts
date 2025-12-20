import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

// Phone validation (Indian format)
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
  .length(10, 'Phone number must be exactly 10 digits');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// OTP validation
export const otpSchema = z
  .string()
  .regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
  .length(6, 'OTP must be exactly 6 digits');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  .trim();

// Aadhaar validation
export const aadhaarSchema = z
  .string()
  .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
  .length(12, 'Aadhaar number must be exactly 12 digits');

// PAN validation
export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
  .length(10, 'PAN must be exactly 10 characters')
  .toUpperCase();

// Register schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema,
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Either email or phone is required',
    path: ['email'],
  }
);

// Login schema
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'), // Can be email or phone
  password: passwordSchema,
});

// Phone OTP request schema
export const phoneOtpRequestSchema = z.object({
  phone: phoneSchema,
});

// Phone OTP verify schema
export const phoneOtpVerifySchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

// Email OTP request schema
export const emailOtpRequestSchema = z.object({
  email: emailSchema,
});

// Email OTP verify schema
export const emailOtpVerifySchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

// Update profile schema
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  address: z.object({
    street: z.string().optional(),
    locality: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    country: z.string().default('India'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

// Verify Aadhaar schema
export const verifyAadhaarSchema = z.object({
  aadhaarNumber: aadhaarSchema,
  otp: otpSchema.optional(),
});

// Verify PAN schema
export const verifyPanSchema = z.object({
  panNumber: panSchema,
  name: nameSchema,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PhoneOtpRequestInput = z.infer<typeof phoneOtpRequestSchema>;
export type PhoneOtpVerifyInput = z.infer<typeof phoneOtpVerifySchema>;
export type EmailOtpRequestInput = z.infer<typeof emailOtpRequestSchema>;
export type EmailOtpVerifyInput = z.infer<typeof emailOtpVerifySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type VerifyAadhaarInput = z.infer<typeof verifyAadhaarSchema>;
export type VerifyPanInput = z.infer<typeof verifyPanSchema>;
