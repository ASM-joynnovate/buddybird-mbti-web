import type { NextConfig } from 'next';

import { withSentryConfig } from '@sentry/nextjs/config';

import { version } from './package.json';

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
	console.warn('[build] NEXT_PUBLIC_FIREBASE_* not set — Firebase analytics will be DISABLED in this build.');
}
if (!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) {
	console.warn(
		'[build] NEXT_PUBLIC_CLARITY_PROJECT_ID not set — Clarity session analytics will be DISABLED in this build.',
	);
}

const nextConfig: NextConfig = {
	output: 'standalone',
	images: {
		formats: ['image/avif', 'image/webp'],
		qualities: [40, 50, 65, 75],
	},
};

export default withSentryConfig(nextConfig, {
	org: 'joynnovate',
	project: 'buddybird-mbti',
	// SENTRY_AUTH_TOKEN이 없으면 소스맵 업로드만 건너뛴다.
	authToken: process.env.SENTRY_AUTH_TOKEN,
	release: { name: `buddybird-mbti-web@${version}` },
	widenClientFileUpload: true,
	silent: !process.env.CI,
});
