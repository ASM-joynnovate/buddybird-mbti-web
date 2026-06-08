// Single source for the BuddyBird app deep link and CTA copy. Surfaced from both
// the intro and result App CTA placements via <AppCtaButton>. Issue #10 (HITL)
// replaces the placeholder with a real OneLink/Branch deep link here and nowhere
// else. APP_CTA_LABEL also seeds the Remote Config default for the result-CTA
// copy experiment (ADR-0011), which is why the copy lives in content/ where
// shared/firebase may import it.

export const APP_CTA_URL = 'https://buddybird.example/app' // PLACEHOLDER (issue #10)
export const APP_CTA_LABEL = '버디버드 앱에서 더 알아보기'
