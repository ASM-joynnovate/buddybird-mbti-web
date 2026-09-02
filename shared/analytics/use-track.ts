'use client';

// Ergonomic tracking hooks layered over the track() facade. Both return stable
// references (safe to pass to memoized children without invalidating them) and
// derive payload types from the AnalyticsEvent union, so adding a new event in
// events.ts is all it takes to get fully typed call sites.
//
//   const track = useTrack()
//   track('app_cta_click', { placement: 'result' })
//
//   const trackCta = useTrackEvent('app_cta_click')
//   trackCta({ placement: 'result' })
import { useCallback } from 'react';

import type { AnalyticsEventName, PayloadOf } from '@/shared/analytics/events';
import { trackEvent } from '@/shared/analytics/track';

// Generic tracker: one stable function for any event name.
export function useTrack(): <N extends AnalyticsEventName>(name: N, payload: PayloadOf<N>) => void {
	return useCallback(<N extends AnalyticsEventName>(name: N, payload: PayloadOf<N>) => {
		trackEvent(name, payload);
	}, []);
}

// Name-curried tracker: fix the event name once, get payload autocompletion.
export function useTrackEvent<N extends AnalyticsEventName>(name: N): (payload: PayloadOf<N>) => void {
	return useCallback(
		(payload: PayloadOf<N>) => {
			trackEvent(name, payload);
		},
		[name],
	);
}
