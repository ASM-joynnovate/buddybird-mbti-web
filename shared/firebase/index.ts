// Public barrel for the Firebase module. The analytics bootstrap moved to
// shared/analytics/analytics-bootstrap.tsx when it became the cross-backend
// boot point (Firebase + Clarity, ADR-0015).

export * from '@/shared/firebase/config';
export * from '@/shared/firebase/client';
export * from '@/shared/firebase/remote-config';
