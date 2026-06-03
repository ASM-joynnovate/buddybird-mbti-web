// Analytics event contract for the parrot MBTI flow.
// All seven funnel events are defined AND wired by the UI (issue #11):
//   - test_start       -> intro start (app/page.tsx)
//   - question_answered-> each choice (app/test/page.tsx)
//   - test_completed   -> result derived (app/test/page.tsx)
//   - photo_attached   -> result photo capture/upload (components/photo-input.tsx, #08)
//   - share_success    -> native Web Share succeeded (components/share-button.tsx, #09)
//   - share_fallback   -> download fallback when share is unsupported (#09)
//   - app_cta_click    -> intro + result app CTA (components/app-cta-button.tsx, #06/#07)

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
