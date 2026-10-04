import { SENTRY_DSN } from '@/lib/sentry/config';

import * as Sentry from '@sentry/nextjs';

export async function register() {
	if (process.env.NEXT_RUNTIME !== 'nodejs') return;
	Sentry.init({
		dsn: SENTRY_DSN,
		environment: process.env.NODE_ENV,
		// 서버 요청은 사진 합성 API 하나뿐이라 토큰 사용량 span을 전부 남긴다.
		tracesSampleRate: 1,
	});
}

export const onRequestError = Sentry.captureRequestError;
