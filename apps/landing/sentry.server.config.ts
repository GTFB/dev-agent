import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://your-dsn-here@your-org.ingest.sentry.io/your-project',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.APP_VERSION || '1.0.0',
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Before send hook for filtering events
  beforeSend(event, hint) {
    // Filter out certain errors in development
    if (process.env.NODE_ENV === 'development') {
      // Filter out development warnings
      if (event.message?.includes('Warning:') || event.message?.includes('Experimental')) {
        return null;
      }
    }
    
    // Add custom context
    event.tags = {
      ...event.tags,
      component: 'server',
      runtime: 'node',
    };
    
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.httpIntegration(),
  ],
  
  // Context
  initialScope: {
    tags: {
      platform: 'node',
      framework: 'nextjs',
    },
  },
});
