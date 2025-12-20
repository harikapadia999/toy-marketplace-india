import { Context, Next } from 'hono';
import { verifyToken, type JwtPayload } from '@toy-marketplace/utils';

// Extend Hono context with user
declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to context
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Get token from Authorization header
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided',
      }, 401);
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const payload = verifyToken(token);
    
    if (!payload) {
      return c.json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      }, 401);
    }
    
    // Attach user to context
    c.set('user', payload);
    
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication failed',
    }, 401);
  }
}

/**
 * Optional authentication middleware
 * Attaches user to context if token is valid, but doesn't require it
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      if (payload) {
        c.set('user', payload);
      }
    }
    
    await next();
  } catch (error) {
    // Silently fail for optional auth
    await next();
  }
}

/**
 * Role-based authorization middleware
 * Requires specific role(s) to access route
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      }, 401);
    }
    
    if (!roles.includes(user.role)) {
      return c.json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions',
      }, 403);
    }
    
    await next();
  };
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Seller-only middleware
 */
export const requireSeller = requireRole('seller', 'both', 'admin');
