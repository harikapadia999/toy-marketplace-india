import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  tracesSampleRate: 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filter out certain errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        // Don't send network errors
        if (error.message?.includes('Network Error')) {
          return null;
        }
      }
    }
    return event;
  },
  
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/toymarketplace\.in/,
        /^https:\/\/api\.toymarketplace\.in/,
      ],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
