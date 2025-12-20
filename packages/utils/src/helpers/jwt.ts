import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
}

/**
 * Generate a JWT token
 * @param payload - Token payload
 * @param expiresIn - Token expiration time (default: 7d)
 * @returns JWT token
 */
export function generateToken(payload: JwtPayload, expiresIn: string = JWT_EXPIRES_IN): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token
 * @param token - JWT token
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Decode a JWT token without verification
 * @param token - JWT token
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a refresh token
 * @param payload - Token payload
 * @returns Refresh token (valid for 30 days)
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Generate an email verification token
 * @param email - User email
 * @returns Verification token (valid for 24 hours)
 */
export function generateEmailVerificationToken(email: string): string {
  return jwt.sign({ email, type: 'email_verification' }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Generate a password reset token
 * @param userId - User ID
 * @returns Reset token (valid for 1 hour)
 */
export function generatePasswordResetToken(userId: string): string {
  return jwt.sign({ userId, type: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verify an email verification token
 * @param token - Verification token
 * @returns Email or null if invalid
 */
export function verifyEmailVerificationToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; type: string };
    if (decoded.type === 'email_verification') {
      return decoded.email;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a password reset token
 * @param token - Reset token
 * @returns User ID or null if invalid
 */
export function verifyPasswordResetToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    if (decoded.type === 'password_reset') {
      return decoded.userId;
    }
    return null;
  } catch (error) {
    return null;
  }
}
