// Lazy Firebase SDK lifecycle (ADR-0011). Every runtime firebase/* import in the
// app lives inside initFirebase() below, so the whole SDK ships as a separate
// chunk loaded off the critical path (idle / first interaction) and never enters
// the main bundle. Do NOT import firebase modules anywhere else — only types.

import type { Analytics, logEvent } from 'firebase/analytics'
import type { FirebaseApp } from 'firebase/app'
import { getFirebaseConfig } from '@/shared/firebase/config'

// The GA logEvent function, handed to consumers so they never import firebase.
export type LogEventFn = typeof logEvent

export interface FirebaseServices {
    app: FirebaseApp
    // Null when the environment cannot run GA (ad blocker, no IndexedDB, etc.).
    analytics: Analytics | null
    logEvent: LogEventFn
}

// Lazy singleton: the first caller kicks off initialization, everyone else
// awaits the same promise. Resolves to null when Firebase is unconfigured or
// the environment rejects it — callers treat null as "analytics stays off".
let initPromise: Promise<FirebaseServices | null> | null = null

export function initFirebase(): Promise<FirebaseServices | null> {
    if (!initPromise) {
        // Swallow init failures (network, ad blockers, private mode): analytics
        // is best-effort and must never break the app. The promise itself is
        // cached so a failed init is not retried within the session.
        initPromise = init().catch(() => null)
    }
    return initPromise
}

async function init(): Promise<FirebaseServices | null> {
    if (typeof window === 'undefined') return null
    const config = getFirebaseConfig()
    if (!config) return null

    const { initializeApp } = await import('firebase/app')
    const app = initializeApp(config)

    const analyticsModule = await import('firebase/analytics')
    const supported = await analyticsModule.isSupported().catch(() => false)
    const analytics = supported ? analyticsModule.getAnalytics(app) : null

    // Performance Monitoring: automatic collection only (page load, network
    // requests). Best-effort — unsupported environments just skip it.
    try {
        const { getPerformance } = await import('firebase/performance')
        getPerformance(app)
    } catch {
        // Performance is optional; never let it block analytics.
    }

    // Remote Config: activate cached values, refresh in the background. Awaited
    // so result-surface consumers see activated values as early as possible;
    // activate() reads local storage, so the wait is negligible.
    const { initRemoteConfig } = await import('@/shared/firebase/remote-config')
    await initRemoteConfig(app)

    return { app, analytics, logEvent: analyticsModule.logEvent }
}
