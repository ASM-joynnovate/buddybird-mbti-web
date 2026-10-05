import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/content/cta';

const ANDROID_PATTERN = /android/i;
const APPLE_MOBILE_PATTERN = /iPhone|iPad|iPod/i;
const MACINTOSH_PATTERN = /Macintosh/;

export function resolveStoreUrl(userAgent: string, maxTouchPoints = 0): string {
	if (ANDROID_PATTERN.test(userAgent)) {
		return PLAY_STORE_URL;
	}
	const isIpadOnMac = MACINTOSH_PATTERN.test(userAgent) && maxTouchPoints > 1;
	if (APPLE_MOBILE_PATTERN.test(userAgent) || isIpadOnMac) {
		return APP_STORE_URL;
	}
	return PLAY_STORE_URL;
}
