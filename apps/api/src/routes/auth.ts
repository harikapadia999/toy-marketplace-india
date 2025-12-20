import { Hono } from 'hono';
import { db, users } from '@toy-marketplace/database';
import {
  registerSchema,
  loginSchema,
  phoneOtpRequestSchema,
  phoneOtpVerifySchema,
  hashPassword,
  verifyPassword,
  generateToken,
  generateOTP,
  generateOTPExpiry,
  verifyOTP,
} from '@toy-marketplace/utils';
import { eq, or } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expiry: Date }>();

/**
 * POST /api/v1/auth/register
 * Register a new user with email/phone and password
 */
app.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: or(
        validatedData.email ? eq(users.email, validatedData.email) : undefined,
        validatedData.phone ? eq(users.phone, validatedData.phone) : undefined
      ),
    });
    
    if (existingUser) {
      return c.json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email or phone already exists',
      }, 400);
    }
    
    // Hash password
    const passwordHash = await hashPassword(validatedData.password);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      passwordHash,
      role: 'buyer',
    }).returning();
    
    // Generate token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    });
    
    return c.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
        token,
      },
    }, 201);
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.name === 'ZodError') {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      }, 400);
    }
    
    return c.json({
      success: false,
      error: 'Registration Failed',
      message: error.message || 'Failed to register user',
    }, 500);
  }
});

/**
 * POST /api/v1/auth/login
 * Login with email/phone and password
 */
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Find user by email or phone
    const user = await db.query.users.findFirst({
      where: or(
        eq(users.email, validatedData.identifier),
        eq(users.phone, validatedData.identifier)
      ),
    });
    
    if (!user || !user.passwordHash) {
      return c.json({
        success: false,
        error: 'Invalid Credentials',
        message: 'Invalid email/phone or password',
      }, 401);
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash);
    
    if (!isValidPassword) {
      return c.json({
        success: false,
        error: 'Invalid Credentials',
        message: 'Invalid email/phone or password',
      }, 401);
    }
    
    // Check if user is banned
    if (user.isBanned) {
      return c.json({
        success: false,
        error: 'Account Banned',
        message: 'Your account has been banned. Please contact support.',
      }, 403);
    }
    
    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    
    return c.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.name === 'ZodError') {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      }, 400);
    }
    
    return c.json({
      success: false,
      error: 'Login Failed',
      message: error.message || 'Failed to login',
    }, 500);
  }
});

/**
 * POST /api/v1/auth/phone/request-otp
 * Request OTP for phone verification
 */
app.post('/phone/request-otp', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input
    const validatedData = phoneOtpRequestSchema.parse(body);
    
    // Generate OTP
    const otp = generateOTP(6);
    const expiry = generateOTPExpiry(10); // 10 minutes
    
    // Store OTP (use Redis in production)
    otpStore.set(validatedData.phone, { otp, expiry });
    
    // TODO: Send OTP via MSG91 SMS service
    console.log(`OTP for ${validatedData.phone}: ${otp}`);
    
    return c.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone: validatedData.phone,
        expiresIn: 600, // 10 minutes in seconds
        // For development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { otp }),
      },
    });
  } catch (error: any) {
    console.error('Request OTP error:', error);
    
    if (error.name === 'ZodError') {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid phone number',
        details: error.errors,
      }, 400);
    }
    
    return c.json({
      success: false,
      error: 'OTP Request Failed',
      message: error.message || 'Failed to send OTP',
    }, 500);
  }
});

/**
 * POST /api/v1/auth/phone/verify-otp
 * Verify OTP and login/register user
 */
app.post('/phone/verify-otp', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input
    const validatedData = phoneOtpVerifySchema.parse(body);
    
    // Get stored OTP
    const storedOtpData = otpStore.get(validatedData.phone);
    
    if (!storedOtpData) {
      return c.json({
        success: false,
        error: 'Invalid OTP',
        message: 'No OTP found for this phone number',
      }, 400);
    }
    
    // Verify OTP
    const isValidOtp = verifyOTP(validatedData.otp, storedOtpData.otp, storedOtpData.expiry);
    
    if (!isValidOtp) {
      return c.json({
        success: false,
        error: 'Invalid OTP',
        message: 'Invalid or expired OTP',
      }, 400);
    }
    
    // Remove OTP from store
    otpStore.delete(validatedData.phone);
    
    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.phone, validatedData.phone),
    });
    
    if (!user) {
      // Create new user
      [user] = await db.insert(users).values({
        phone: validatedData.phone,
        phoneVerified: true,
        name: `User ${validatedData.phone.slice(-4)}`,
        role: 'buyer',
      }).returning();
    } else {
      // Update phone verification status
      await db.update(users)
        .set({ 
          phoneVerified: true,
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    
    return c.json({
      success: true,
      message: 'Phone verified successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          phoneVerified: true,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    
    if (error.name === 'ZodError') {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      }, 400);
    }
    
    return c.json({
      success: false,
      error: 'OTP Verification Failed',
      message: error.message || 'Failed to verify OTP',
    }, 500);
  }
});

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
app.get('/me', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUser.userId),
    });
    
    if (!user) {
      return c.json({
        success: false,
        error: 'User Not Found',
        message: 'User not found',
      }, 404);
    }
    
    return c.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        aadhaarVerified: user.aadhaarVerified,
        rating: user.rating,
        totalSales: user.totalSales,
        totalPurchases: user.totalPurchases,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    
    return c.json({
      success: false,
      error: 'Failed to Get Profile',
      message: error.message || 'Failed to get user profile',
    }, 500);
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout user (client-side token removal)
 */
app.post('/logout', authMiddleware, async (c) => {
  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default app;
