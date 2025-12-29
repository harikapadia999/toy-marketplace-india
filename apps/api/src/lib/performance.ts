import compression from 'compression';
import { Hono } from 'hono';

// Compression middleware
export const compressionMiddleware = () => {
  return compression({
    level: 6, // Compression level (0-9)
    threshold: 1024, // Only compress responses > 1KB
    filter: (req: any, res: any) => {
      // Don't compress if client doesn't accept encoding
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression filter
      return compression.filter(req, res);
    },
  });
};

// Response time middleware
export const responseTimeMiddleware = () => {
  return async (c: any, next: any) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    c.header('X-Response-Time', `${duration}ms`);
  };
};

// ETag middleware for caching
export const etagMiddleware = () => {
  return async (c: any, next: any) => {
    await next();

    // Generate ETag from response body
    if (c.res.status === 200) {
      try {
        const body = await c.res.clone().text();
        const etag = `"${Buffer.from(body).toString('base64').slice(0, 27)}"`;
        
        c.header('ETag', etag);

        // Check if client has cached version
        const clientEtag = c.req.header('if-none-match');
        if (clientEtag === etag) {
          return c.body(null, 304); // Not Modified
        }
      } catch (error) {
        // Skip ETag for non-text responses
      }
    }
  };
};

// Request size limit middleware
export const requestSizeLimitMiddleware = (maxSize: number = 10 * 1024 * 1024) => {
  return async (c: any, next: any) => {
    const contentLength = parseInt(c.req.header('content-length') || '0');
    
    if (contentLength > maxSize) {
      return c.json({
        error: 'Request entity too large',
        maxSize: `${maxSize / 1024 / 1024}MB`,
      }, 413);
    }

    await next();
  };
};

// Database connection pooling optimization
export const optimizeDbConnections = () => {
  return {
    max: 20, // Maximum pool size
    min: 5, // Minimum pool size
    idle: 10000, // Idle timeout (10 seconds)
    acquire: 30000, // Acquire timeout (30 seconds)
    evict: 1000, // Eviction run interval (1 second)
  };
};

// Query optimization helpers
export const optimizeQuery = (query: any) => {
  return {
    ...query,
    // Add indexes hint
    useIndex: true,
    // Limit result set
    limit: Math.min(query.limit || 100, 100),
    // Select only needed fields
    select: query.select || '*',
  };
};

// Image optimization settings
export const imageOptimizationSettings = {
  quality: 'auto', // Automatic quality
  format: 'auto', // Automatic format (WebP, AVIF)
  maxWidth: 1920,
  maxHeight: 1920,
  thumbnail: {
    width: 200,
    height: 200,
    crop: 'fill',
  },
  responsive: [320, 640, 768, 1024, 1280, 1920],
};

// API response optimization
export const optimizeApiResponse = (data: any) => {
  // Remove null/undefined values
  const removeEmpty = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(removeEmpty);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.entries(obj)
        .filter(([_, v]) => v != null)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: removeEmpty(v) }), {});
    }
    return obj;
  };

  return removeEmpty(data);
};

// Lazy loading configuration
export const lazyLoadingConfig = {
  threshold: 0.1, // Load when 10% visible
  rootMargin: '50px', // Start loading 50px before visible
  triggerOnce: true, // Only load once
};

// Code splitting configuration
export const codeSplittingConfig = {
  chunks: 'async', // Split async chunks
  minSize: 20000, // Minimum chunk size (20KB)
  maxSize: 244000, // Maximum chunk size (244KB)
  minChunks: 1, // Minimum times chunk is shared
  maxAsyncRequests: 30, // Maximum parallel requests
  maxInitialRequests: 30, // Maximum initial requests
};

// Performance monitoring thresholds
export const performanceThresholds = {
  apiResponseTime: 500, // 500ms
  databaseQueryTime: 100, // 100ms
  cacheHitRate: 0.8, // 80%
  errorRate: 0.01, // 1%
  cpuUsage: 0.7, // 70%
  memoryUsage: 0.8, // 80%
};

// Performance metrics collector
export const collectPerformanceMetrics = () => {
  return {
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
  };
};
