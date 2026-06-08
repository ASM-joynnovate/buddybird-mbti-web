// Analytics event contract for the parrot MBTI flow — the single dictionary of
// every event the app can emit. Each member carries a one-line note: when it
// fires and which file instruments it. GA4 mapping rules live in
// firebase-adapter.ts (payload keys -> snake_case, `type` -> `parrot_type`).
//
// Core funnel (issue #11): test_start, question_answered, test_completed,
// photo_attached, share_success, share_fallback, app_cta_click.
// Exploration/diagnostic events (tracking expansion): deck_*, detail_*,
// test_back, result_*, restart_click, share_cancel/error, photo_removed,
// image_error.
//
// Deliberately NOT tracked (summary-only policy): scrub wheel/touch ticks,
// back-stack hover, carousel/quiz auto-advance, photo retake/reselect buttons
// (covered by the resulting photo_attached re-fire).

import type { TypeCode } from '@/lib/mbti/types'

// The union of every analytics event name the app can emit.
export type AnalyticsEventName =
    | 'test_start'
    | 'question_answered'
    | 'test_completed'
    | 'photo_attached'
    | 'share_success'
    | 'share_fallback'
    | 'app_cta_click'
    | 'deck_open'
    | 'deck_close'
    | 'detail_open'
    | 'detail_close'
    | 'detail_cta_click'
    | 'test_back'
    | 'result_view'
    | 'result_error'
    | 'restart_click'
    | 'share_cancel'
    | 'share_error'
    | 'photo_removed'
    | 'image_error'

// Payload type for a given event name, derived from the discriminated union.
// Adding a new event to AnalyticsEvent automatically types every consumer
// (useTrack / useTrackEvent / withTrack / the GA4 adapter mapping).
export type PayloadOf<N extends AnalyticsEventName> = Extract<
    AnalyticsEvent,
    { name: N }
>['payload']

// Discriminated union pairing each event name with its typed payload.
export type AnalyticsEvent =
    // Intro "테스트 시작하기" tap (features/intro/intro-view.tsx).
    | { name: 'test_start'; payload: Record<string, never> }
    // Each quiz choice tap (features/quiz/test-view.tsx).
    | {
          name: 'question_answered'
          payload: { questionId: string; choiceId: string; index: number }
      }
    // Result derived after the last answer (features/quiz/test-view.tsx).
    | { name: 'test_completed'; payload: { type: TypeCode } }
    // Result-page photo capture/upload (features/share/photo-input.tsx).
    | { name: 'photo_attached'; payload: { source: 'camera' | 'gallery' } }
    // Native Web Share succeeded (features/share/share-button.tsx).
    | { name: 'share_success'; payload: { type: TypeCode } }
    // Download fallback when Web Share is unsupported (features/share/share-button.tsx).
    | { name: 'share_fallback'; payload: { type: TypeCode; reason: string } }
    // App CTA tap on either surface (features/app-install/app-cta-button.tsx).
    | { name: 'app_cta_click'; payload: { placement: 'intro' | 'result' } }
    // Deck overlay committed open — button or scrub past the snap threshold,
    // duplicate-guarded (features/deck/deck-overlay/use-deck-controller.ts).
    | {
          name: 'deck_open'
          payload: { source: 'intro' | 'result'; trigger: 'button' | 'scrub' }
      }
    // Deck overlay closed by the user; programmatic closes do not fire
    // (features/deck/deck-overlay/use-deck-controller.ts).
    | {
          name: 'deck_close'
          payload: { source: 'intro' | 'result'; trigger: 'button' | 'gesture' }
      }
    // Detail popup opened: intro back-stack card / deck grid card / result
    // match card / match chip swap (instrumented at the owning views:
    // features/intro/intro-view.tsx, features/result/result-view.tsx).
    | {
          name: 'detail_open'
          payload: { type: TypeCode; source: 'stack' | 'deck' | 'match' | 'chip' }
      }
    // Detail popup dismissed (features/deck/detail-popup.tsx).
    | { name: 'detail_close'; payload: { method: 'button' | 'scrim' | 'escape' } }
    // Detail popup CTA "이 친구 홈에서 보기" (features/intro/intro-view.tsx).
    | { name: 'detail_cta_click'; payload: { type: TypeCode } }
    // Quiz back button; index 0 means leaving to the intro
    // (features/quiz/test-view.tsx).
    | { name: 'test_back'; payload: { index: number } }
    // Result screen entered, once per mount — owner vs shared-link visitor
    // (features/result/result-view.tsx).
    | { name: 'result_view'; payload: { type: TypeCode; visitor: 'owner' | 'shared' } }
    // Result screen failed to resolve a type: ?t= missing vs decode failure
    // (features/result/result-view.tsx).
    | { name: 'result_error'; payload: { reason: 'missing' | 'invalid' } }
    // Restart taps: own-result retry / shared visitor "나도 테스트하기" (viral
    // loop) / error-screen home (features/result/result-view.tsx).
    | { name: 'restart_click'; payload: { source: 'owner' | 'shared' | 'error' } }
    // Web Share sheet dismissed by the user (AbortError)
    // (features/share/share-button.tsx).
    | { name: 'share_cancel'; payload: { type: TypeCode } }
    // Share card canvas composition failed (features/share/share-button.tsx).
    | { name: 'share_error'; payload: { type: TypeCode } }
    // Attached photo removed on the result page (features/share/photo-input.tsx).
    | { name: 'photo_removed'; payload: Record<string, never> }
    // Parrot artwork failed to load, deduped to once per type per page load
    // (shared/ui/parrot-image.tsx).
    | { name: 'image_error'; payload: { type: TypeCode } }
