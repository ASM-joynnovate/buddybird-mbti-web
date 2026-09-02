// Public tracking facade. UI code imports only this function and never touches the
// adapter directly, keeping the call sites decoupled from the active sink.
import { getAnalyticsAdapter } from '@/shared/analytics/adapter';
import type { AnalyticsEvent, AnalyticsEventName, PayloadOf } from '@/shared/analytics/events';

// Emit a typed analytics event through the currently active adapter.
export function track(event: AnalyticsEvent): void {
	getAnalyticsAdapter().track(event);
}

// Pair-form emitter used by the ergonomic wrappers (useTrack / useTrackEvent /
// withTrack). This is the ONLY place allowed to cast: a (name, PayloadOf<name>)
// pair is a valid union member by construction, but TypeScript cannot correlate
// the two generics. Keeping the cast here means the wrappers stay cast-free and
// a future change to the AnalyticsEvent shape has a single site to re-verify.
export function trackEvent<N extends AnalyticsEventName>(name: N, payload: PayloadOf<N>): void {
	track({ name, payload } as AnalyticsEvent);
}
