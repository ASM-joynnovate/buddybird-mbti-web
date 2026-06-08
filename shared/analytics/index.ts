// Public barrel for the analytics module.

export * from '@/shared/analytics/events'
export * from '@/shared/analytics/adapter'
export * from '@/shared/analytics/track'
export * from '@/shared/analytics/test-hook'
export * from '@/shared/analytics/use-track'
export * from '@/shared/analytics/with-track'
// firebase-adapter is deliberately NOT re-exported: only the Firebase bootstrap
// (shared/firebase) should construct it.
