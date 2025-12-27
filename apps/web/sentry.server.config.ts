import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  tracesSampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filter out certain errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        // Don't send database connection errors in development
        if (process.env.NODE_ENV === 'development' && error.message?.includes('ECONNREFUSED')) {
          return null;
        }
      }
    }
    return event;
  },
});
