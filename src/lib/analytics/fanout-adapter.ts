import type { AnalyticsAdapter } from '@/lib/analytics/adapter';
import type { AnalyticsEvent } from '@/lib/analytics/events';

export function createFanoutAdapter(adapters: readonly AnalyticsAdapter[]): AnalyticsAdapter {
	if (adapters.length === 1) return adapters[0];
	return {
		track(event: AnalyticsEvent): void {
			adapters.forEach((adapter) => {
				try {
					adapter.track(event);
				} catch {}
			});
		},
	};
}
