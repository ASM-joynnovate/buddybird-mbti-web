import type { AnalyticsAdapter } from '@/lib/analytics/adapter';
import type { AnalyticsEvent } from '@/lib/analytics/events';
import type { ClarityClient } from '@/lib/clarity/client';

const UPGRADE_EVENTS: ReadonlySet<AnalyticsEvent['name']> = new Set([
	'test_completed',
	'share_success',
	'share_error',
	'result_error',
]);

function applyTags(event: AnalyticsEvent, clarity: ClarityClient): void {
	switch (event.name) {
		case 'test_completed':
			clarity.setTag('parrot_type', event.payload.type);
			return;
		case 'result_view':
			clarity.setTag('parrot_type', event.payload.type);
			clarity.setTag('visitor', event.payload.visitor);
			return;
		default:
			return;
	}
}

export function createClarityAdapter(clarity: ClarityClient): AnalyticsAdapter {
	return {
		track(event: AnalyticsEvent): void {
			clarity.event(event.name);
			applyTags(event, clarity);
			if (UPGRADE_EVENTS.has(event.name)) clarity.upgrade(event.name);
		},
	};
}
