// Public barrel for the analytics module.

export * from '@/shared/analytics/events'
export * from '@/shared/analytics/adapter'
export * from '@/shared/analytics/track'
export * from '@/shared/analytics/test-hook'
export * from '@/shared/analytics/use-track'
export * from '@/shared/analytics/with-track'
// firebase-adapter, clarity-adapter, fanout-adapter and analytics-bootstrap are
// deliberately NOT re-exported: only the bootstrap constructs the adapters, and
// the root layout is the bootstrap's only consumer — barrel inclusion would
// pull both SDK config modules into every feature that imports track().
