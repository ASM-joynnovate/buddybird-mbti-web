// Single source for the App CTA copy and store links. The CTA has no deep-link
// service (OneLink/Branch): <AppCtaButton> reads the device from the User-Agent
// (branching in lib/store-link) and points at the matching store, defaulting to
// Play on desktop/unknown. See ADR-0016. The URLs live here — not in lib — so
// shared/firebase can read APP_CTA_LABEL as the Remote Config default for the
// result-CTA copy experiment (ADR-0011).
//
// Attribution rides on the store URLs themselves:
//  - Play: a utm `referrer` param, read app-side via the Install Referrer API.
//  - App Store: an App Store Connect campaign link (pt/ct), see below.

// App Store Connect campaign link (pt=provider token, ct=campaign) so iOS installs
// attribute in App Analytics; the /app/apple-store/ path is the campaign-link form.
export const APP_STORE_URL =
    'https://apps.apple.com/app/apple-store/id6783652711?pt=129074287&ct=buddybird-mbti-web&mt=8'
export const PLAY_STORE_URL =
    'https://play.google.com/store/apps/details?id=com.joynnovate.buddybird&referrer=utm_source%3Dparrot_mbti%26utm_medium%3Dapp_cta'
export const APP_CTA_LABEL = '버디버드 앱에서 더 알아보기'
