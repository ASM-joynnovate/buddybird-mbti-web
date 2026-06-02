// Analytics event contract for the parrot MBTI flow.
// All seven events are DEFINED here, but only three (test_start, question_answered,
// test_completed) are wired by the UI in the foundation slice (issue #11).
//
// The remaining four are intentionally deferred — their emit points land in later
// issues, with no UI yet:
//   - photo_attached  -> issue #08 (result photo capture/upload)
//   - share_success   -> issue #09 (Canvas share card + Web Share API)
//   - share_fallback  -> issue #09 (download fallback when share is unsupported)
//   - app_cta_click   -> issues #06/#07/#10 (intro + result app CTA placements)

import type { Axis, TypeCode } from '@/lib/mbti/types'

// The union of every analytics event name the app can emit.
export type AnalyticsEventName =
    | 'test_start'
    | 'question_answered'
    | 'test_completed'
    | 'photo_attached'
    | 'share_success'
    | 'share_fallback'
    | 'app_cta_click'

// Discriminated union pairing each event name with its typed payload.
export type AnalyticsEvent =
    | { name: 'test_start'; payload: Record<string, never> }
    | {
          name: 'question_answered'
          payload: { questionId: string; choiceId: string; axis: Axis; index: number }
      }
    | { name: 'test_completed'; payload: { type: TypeCode } }
    | { name: 'photo_attached'; payload: { source: 'camera' | 'gallery' } }
    | { name: 'share_success'; payload: { type: TypeCode } }
    | { name: 'share_fallback'; payload: { type: TypeCode; reason: string } }
    | { name: 'app_cta_click'; payload: { placement: 'intro' | 'result' } }
