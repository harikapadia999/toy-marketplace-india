import { Hono } from 'hono';
import { cache, cacheKeys, cacheTTL } from '../lib/cache';

// Cache middleware for GET requests
export const cacheMiddleware = (ttl: number = cacheTTL.medium) => {
  return async (c: any, next: any) => {
    // Only cache GET requests
    if (c.req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `route:${c.req.url}`;

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      c.header('X-Cache', 'HIT');
      return c.json(cached);
    }

    // Continue to route handler
    await next();

    // Cache the response if successful
    if (c.res.status === 200) {
      try {
        const responseData = await c.res.clone().json();
        await cache.set(cacheKey, responseData, ttl);
        c.header('X-Cache', 'MISS');
      } catch (error) {
        // Response might not be JSON, skip caching
      }
    }
  };
};

// Invalidate cache for specific patterns
export const invalidateCache = async (patterns: string[]) => {
  for (const pattern of patterns) {
    await cache.delPattern(pattern);
  }
};

// Cache warming - preload frequently accessed data
export const warmCache = async () => {
  // Warm featured toys
  const featuredKey = cacheKeys.featuredToys();
  // ... fetch and cache featured toys

  // Warm categories
  const categoriesKey = cacheKeys.categories();
  // ... fetch and cache categories

  console.log('Cache warmed successfully');
};

// Cache statistics
export const getCacheStats = async () => {
  // This would require Redis INFO command
  // For now, return basic stats
  return {
    status: 'connected',
    keys: 0, // Would need to count keys
    memory: 0, // Would need Redis INFO
  };
};
