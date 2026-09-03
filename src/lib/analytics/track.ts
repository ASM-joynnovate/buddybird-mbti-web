import { getAnalyticsAdapter } from '@/lib/analytics/adapter';
import type { AnalyticsEvent, AnalyticsEventName, PayloadOf } from '@/lib/analytics/events';

export function track(event: AnalyticsEvent): void {
	getAnalyticsAdapter().track(event);
}

export function trackEvent<N extends AnalyticsEventName>(name: N, payload: PayloadOf<N>): void {
	track({ name, payload } as AnalyticsEvent);
}
