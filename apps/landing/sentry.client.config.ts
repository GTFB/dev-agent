import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://your-dsn-here@your-org.ingest.sentry.io/your-project',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Before send hook for filtering events
  beforeSend(event, hint) {
    // Filter out certain errors in development
    if (process.env.NODE_ENV === 'development') {
      // Filter out React development warnings
      if (event.message?.includes('Warning:') || event.message?.includes('React does not recognize')) {
        return null;
      }
    }
    
    // Add custom context
    event.tags = {
      ...event.tags,
      component: 'client',
      page: window.location.pathname,
    };
    
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Context
  initialScope: {
    tags: {
      platform: 'web',
      framework: 'nextjs',
    },
  },
});
