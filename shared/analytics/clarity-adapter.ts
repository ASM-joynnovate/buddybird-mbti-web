// Microsoft Clarity sink for the analytics adapter slot (ADR-0015). Every typed
// funnel event lands on the session timeline via Clarity.event(name) — the npm
// wrapper takes a name only, so detailed parameters remain GA4's job
// (firebase-adapter.ts) and Clarity carries session-level tags instead.
// This module imports the ClarityClient type only — SDK loading is owned by
// shared/clarity. Deliberately NOT re-exported from the analytics barrel: only
// analytics-bootstrap.tsx should construct this adapter.

import type { AnalyticsAdapter } from '@/shared/analytics/adapter'
import type { AnalyticsEvent } from '@/shared/analytics/events'
import type { ClarityClient } from '@/shared/clarity/client'

// Sessions worth full capture regardless of Clarity's sampling: the funnel
// outcomes (completion, viral share) and the two failure modes we debug from
// recordings. upgrade() is idempotent per session, so re-fires are harmless.
const UPGRADE_EVENTS: ReadonlySet<AnalyticsEvent['name']> = new Set([
    'test_completed',
    'share_success',
    'share_error',
    'result_error',
])

// Session tags: dimensions worth filtering recordings by in the dashboard.
// parrot_type tags the session with the derived result; visitor distinguishes
// owner sessions from shared-link visitors (the viral loop).
function applyTags(event: AnalyticsEvent, clarity: ClarityClient): void {
    switch (event.name) {
        case 'test_completed':
            clarity.setTag('parrot_type', event.payload.type)
            return
        case 'result_view':
            clarity.setTag('parrot_type', event.payload.type)
            clarity.setTag('visitor', event.payload.visitor)
            return
        default:
            return
    }
}

// Build the Clarity adapter around an initialized client. Pure event fan-in:
// name onto the timeline, tags for the session, upgrade on key moments.
export function createClarityAdapter(clarity: ClarityClient): AnalyticsAdapter {
    return {
        track(event: AnalyticsEvent): void {
            clarity.event(event.name)
            applyTags(event, clarity)
            if (UPGRADE_EVENTS.has(event.name)) clarity.upgrade(event.name)
        },
    }
}
