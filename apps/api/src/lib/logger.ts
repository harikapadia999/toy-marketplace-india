import { createLogger, format, transports } from 'winston';

const { combine, timestamp, errors, json, printf } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create logger instance
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'toy-marketplace-api' },
  transports: [
    // Write all logs to console
    new transports.Console({
      format: combine(
        format.colorize(),
        consoleFormat
      ),
    }),
    
    // Write all logs with level 'error' to error.log
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs to combined.log
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to console with more detail
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

// Helper functions
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Request logging middleware
export const requestLogger = (c: any, next: any) => {
  const start = Date.now();
  
  return next().then(() => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration: `${duration}ms`,
      userAgent: c.req.header('user-agent'),
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    });
  });
};
