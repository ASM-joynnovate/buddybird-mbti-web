import { getClarityProjectId } from '@/lib/clarity/config';

export interface ClarityClient {
	event(name: string): void;
	setTag(key: string, value: string): void;
	upgrade(reason: string): void;
}

let initPromise: Promise<ClarityClient | null> | null = null;

export function initClarity(): Promise<ClarityClient | null> {
	if (!initPromise) {
		initPromise = init().catch(() => null);
	}
	return initPromise;
}

async function init(): Promise<ClarityClient | null> {
	if (typeof window === 'undefined') return null;
	const projectId = getClarityProjectId();
	if (!projectId) return null;

	const { default: Clarity } = await import('@microsoft/clarity');
	Clarity.init(projectId);

	if (typeof (window as { clarity?: unknown }).clarity !== 'function') return null;

	return {
		event(name: string): void {
			try {
				Clarity.event(name);
			} catch {}
		},
		setTag(key: string, value: string): void {
			try {
				Clarity.setTag(key, value);
			} catch {}
		},
		upgrade(reason: string): void {
			try {
				Clarity.upgrade(reason);
			} catch {}
		},
	};
}
