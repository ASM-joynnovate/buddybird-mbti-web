// Firebase Analytics (GA4) sink for the analytics adapter slot (ADR-0011).
// Event names map 1:1 to GA4 custom events (no reserved-name collisions);
// payload keys are converted to snake_case per GA4 parameter conventions.
// This module imports firebase types only — the runtime Analytics instance and
// logEvent function are injected by shared/firebase, which owns all SDK loading.
// Deliberately NOT re-exported from the analytics barrel: only
// analytics-bootstrap.tsx should construct this adapter.

import type { Analytics } from 'firebase/analytics'
import type { TypeCode } from '@/lib/mbti/types'
import { consoleAdapter, type AnalyticsAdapter } from '@/shared/analytics/adapter'
import type { AnalyticsEvent } from '@/shared/analytics/events'
import type { LogEventFn } from '@/shared/firebase/client'

// GA4 event parameters derived from a typed funnel event payload.
type GaParams = Record<string, string | number | boolean>

// Rename `type` (a TypeCode) to `parrot_type` — avoids ambiguity with GA's own
// dimensions — and pass every other single-word key through unchanged.
function renameType(payload: { type: TypeCode } & Record<string, string | number>): GaParams {
    const { type, ...rest } = payload
    return { ...rest, parrot_type: type }
}

// Map each typed payload to GA4 snake_case parameters. Payload keys are single
// words by convention (source/trigger/method/index/reason/visitor/placement),
// so most cases pass through; question_answered is the only camelCase rename.
// No default branch: the GaParams return type makes the switch exhaustive
// (TS2366 on a missing union member).
function toGaParams(event: AnalyticsEvent): GaParams {
    switch (event.name) {
        case 'test_start':
        case 'photo_removed':
            return {}
        case 'question_answered':
            return {
                question_id: event.payload.questionId,
                choice_id: event.payload.choiceId,
                index: event.payload.index,
            }
        case 'test_completed':
        case 'share_success':
        case 'share_cancel':
        case 'share_error':
        case 'detail_cta_click':
        case 'image_error':
            return { parrot_type: event.payload.type }
        case 'share_fallback':
        case 'detail_open':
        case 'result_view':
            return renameType(event.payload)
        case 'photo_attached':
        case 'app_cta_click':
        case 'deck_open':
        case 'deck_close':
        case 'detail_close':
        case 'test_back':
        case 'restart_click':
        case 'result_error':
        case 'species_selected':
            return { ...event.payload }
    }
}

// Build the GA4 adapter around an initialized Analytics instance. In dev the
// console sink runs alongside and events carry debug_mode so they surface in
// the GA DebugView stream.
export function createFirebaseAdapter(
    analytics: Analytics,
    logEvent: LogEventFn,
): AnalyticsAdapter {
    const isDev = process.env.NODE_ENV === 'development'
    return {
        track(event: AnalyticsEvent): void {
            if (isDev) consoleAdapter.track(event)
            const params = toGaParams(event)
            logEvent(analytics, event.name, isDev ? { ...params, debug_mode: true } : params)
        },
    }
}
