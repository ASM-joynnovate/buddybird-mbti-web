import { getFirebaseConfig } from '@/lib/firebase/config';

import type { Analytics, logEvent } from 'firebase/analytics';
import type { FirebaseApp } from 'firebase/app';

export type LogEventFn = typeof logEvent;

export interface FirebaseServices {
	app: FirebaseApp;
	analytics: Analytics | null;
	logEvent: LogEventFn;
}

let initPromise: Promise<FirebaseServices | null> | null = null;

export function initFirebase(): Promise<FirebaseServices | null> {
	if (!initPromise) {
		initPromise = init().catch(() => null);
	}
	return initPromise;
}

async function init(): Promise<FirebaseServices | null> {
	if (typeof window === 'undefined') return null;
	const config = getFirebaseConfig();
	if (!config) return null;

	const [{ initializeApp }, analyticsModule, performanceModule, { initRemoteConfig }] = await Promise.all([
		import('firebase/app'),
		import('firebase/analytics'),
		import('firebase/performance').catch(() => null),
		import('@/lib/firebase/remote-config'),
	]);
	const app = initializeApp(config);

	const supported = await analyticsModule.isSupported().catch(() => false);
	const analytics = supported ? analyticsModule.getAnalytics(app) : null;

	try {
		performanceModule?.getPerformance(app);
	} catch {}

	await initRemoteConfig(app);

	return { app, analytics, logEvent: analyticsModule.logEvent };
}
