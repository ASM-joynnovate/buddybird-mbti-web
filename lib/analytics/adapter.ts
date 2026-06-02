// Analytics adapter (sink) abstraction.
// The concrete backend (GA4, Amplitude, etc.) is TBD; the default sink is a console
// stub. The active adapter is held in a module-level mutable reference so an E2E
// harness can swap in a capturing adapter at runtime via setAnalyticsAdapter.

import type { AnalyticsEvent } from '@/lib/analytics/events'

// A sink that receives fully-typed analytics events.
export interface AnalyticsAdapter {
    track(event: AnalyticsEvent): void
}

// Default sink: logs events to the console. This is the intended default behavior
// until a real analytics backend is wired in, so the console call is deliberate.
export const consoleAdapter: AnalyticsAdapter = {
    track(event: AnalyticsEvent): void {
        // Deliberate console sink: the default analytics behavior until a real
        // backend is wired in. The project's ESLint config does not enable the
        // no-console rule, so no disable directive is required here.
        console.log('[analytics]', event.name, event.payload)
    },
}

// Module-level mutable reference to the active adapter.
let currentAdapter: AnalyticsAdapter = consoleAdapter

// Replace the active analytics adapter (used by the E2E test hook).
export function setAnalyticsAdapter(adapter: AnalyticsAdapter): void {
    currentAdapter = adapter
}

// Read the active analytics adapter.
export function getAnalyticsAdapter(): AnalyticsAdapter {
    return currentAdapter
}
