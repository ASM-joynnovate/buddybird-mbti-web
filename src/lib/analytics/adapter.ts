import type { AnalyticsEvent } from '@/lib/analytics/events';

export interface AnalyticsAdapter {
	track(event: AnalyticsEvent): void;
}

export const consoleAdapter: AnalyticsAdapter = {
	track(event: AnalyticsEvent): void {
		console.log('[analytics]', event.name, event.payload);
	},
};

let currentAdapter: AnalyticsAdapter = consoleAdapter;

export function setAnalyticsAdapter(adapter: AnalyticsAdapter): void {
	currentAdapter = adapter;
}

export function getAnalyticsAdapter(): AnalyticsAdapter {
	return currentAdapter;
}
