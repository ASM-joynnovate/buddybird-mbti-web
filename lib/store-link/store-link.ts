// Client-side store routing for the App CTA (ADR-0016). No deep-link service:
// a single CTA reads the device from the User-Agent and returns the matching
// store URL, defaulting to Play for desktop and any UA we can't classify.
import { APP_STORE_URL, PLAY_STORE_URL } from '@/content/cta';

// Resolve the store URL for a device. `maxTouchPoints` disambiguates iPadOS 13+,
// which reports a desktop-Mac User-Agent — a touch-capable "Macintosh" is an iPad,
// so it belongs on the App Store, not the desktop Play fallback.
export function resolveStoreUrl(userAgent: string, maxTouchPoints = 0): string {
	if (/android/i.test(userAgent)) {
		return PLAY_STORE_URL;
	}
	const isIpadOnMac = /Macintosh/.test(userAgent) && maxTouchPoints > 1;
	if (/iPhone|iPad|iPod/i.test(userAgent) || isIpadOnMac) {
		return APP_STORE_URL;
	}
	return PLAY_STORE_URL;
}
