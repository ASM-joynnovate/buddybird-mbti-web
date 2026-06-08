// The CTA link and copy moved to content/cta.ts so shared/firebase can use the
// label as the Remote Config default (shared must not import features). This
// re-export keeps existing '@/features/app-install' imports working.

export { APP_CTA_LABEL, APP_CTA_URL } from '@/content/cta'
