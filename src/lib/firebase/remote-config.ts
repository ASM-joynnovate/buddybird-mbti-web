import { APP_CTA_LABEL } from '@/lib/content/cta';

import type { FirebaseApp } from 'firebase/app';
import type { RemoteConfig, getValue } from 'firebase/remote-config';

export const REMOTE_DEFAULTS = {
	result_cta_label: APP_CTA_LABEL,
	clarity_enabled: 'true',
} as const;

export type RemoteConfigKey = keyof typeof REMOTE_DEFAULTS;

const PROD_FETCH_INTERVAL_MS = 12 * 60 * 60 * 1000;

let activeConfig: RemoteConfig | null = null;
let getValueFn: typeof getValue | null = null;
const listeners = new Set<() => void>();

function emitReady(): void {
	listeners.forEach((listener) => listener());
}

export function subscribeRemoteConfig(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export async function initRemoteConfig(app: FirebaseApp): Promise<void> {
	try {
		const rcModule = await import('firebase/remote-config');
		const rc = rcModule.getRemoteConfig(app);
		rc.settings.minimumFetchIntervalMillis = process.env.NODE_ENV === 'development' ? 0 : PROD_FETCH_INTERVAL_MS;
		rc.defaultConfig = REMOTE_DEFAULTS;
		await rcModule.activate(rc);
		void rcModule.fetchConfig(rc).catch(() => {});
		activeConfig = rc;
		getValueFn = rcModule.getValue;
		emitReady();
	} catch {}
}

export function getRemoteConfigString(key: RemoteConfigKey): string {
	if (!activeConfig || !getValueFn) return REMOTE_DEFAULTS[key];
	try {
		const value = getValueFn(activeConfig, key).asString();
		return value || REMOTE_DEFAULTS[key];
	} catch {
		return REMOTE_DEFAULTS[key];
	}
}
