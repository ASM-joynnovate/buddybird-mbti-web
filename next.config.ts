import type { NextConfig } from 'next';

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

export default nextConfig;
