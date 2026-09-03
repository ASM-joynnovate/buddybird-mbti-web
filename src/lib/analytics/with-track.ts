import type { AnalyticsEventName, PayloadOf } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/track';

export function withTrack<N extends AnalyticsEventName, Args extends unknown[]>(
	name: N,
	payload: PayloadOf<N> | ((...args: Args) => PayloadOf<N>),
	handler?: (...args: Args) => void,
): (...args: Args) => void {
	return (...args: Args) => {
		const resolved =
			typeof payload === 'function' ? (payload as (...args: Args) => PayloadOf<N>)(...args) : payload;
		trackEvent(name, resolved);
		handler?.(...args);
	};
}
