// Composite sink: forwards every event to multiple adapters in order (ADR-0015).
// Used by the analytics bootstrap to run GA4 and Clarity side by side without
// widening the single-adapter slot contract.
import type { AnalyticsAdapter } from '@/shared/analytics/adapter';
import type { AnalyticsEvent } from '@/shared/analytics/events';

// Build an adapter that fans each event out to all given sinks. A single-sink
// array collapses to that sink directly (no wrapper indirection). Each sink is
// isolated: one sink throwing must not suppress delivery to the others.
export function createFanoutAdapter(adapters: readonly AnalyticsAdapter[]): AnalyticsAdapter {
	if (adapters.length === 1) return adapters[0];
	return {
		track(event: AnalyticsEvent): void {
			adapters.forEach((adapter) => {
				try {
					adapter.track(event);
				} catch {
					// Best-effort: analytics must never break the app or
					// starve a sibling sink.
				}
			});
		},
	};
}
