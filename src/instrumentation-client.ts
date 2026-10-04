import { SENTRY_DSN } from '@/lib/sentry/config';

import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: SENTRY_DSN,
	environment: process.env.NODE_ENV,
	tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
