'use client'

// Boots the analytics backends off the critical path: Firebase (ADR-0011) and
// Microsoft Clarity (ADR-0015) share one idle/first-interaction trigger.
// Mounted once in the root layout as a null-render client component. On mount
// it installs a buffering analytics adapter (so early events like test_start
// are not lost), then loads the SDK chunks on idle or first interaction —
// whichever fires first — and swaps in a fan-out over the sinks that came up
// (GA4 and/or Clarity), flushing the buffer to all of them.
//
// Lives in shared/analytics (not shared/firebase or shared/clarity) because it
// orchestrates ACROSS backends; the dependency direction stays one-way:
// analytics-bootstrap → shared/firebase + shared/clarity. Deliberately NOT
// re-exported from the analytics barrel — the root layout is its only consumer
// and barrel inclusion would pull both SDK config modules into every feature.
//
// E2E compatibility: the swap is guarded by adapter reference checks, so a
// capturing adapter installed via window.__setAnalyticsAdapter always wins,
// whether it was installed before or after this bootstrap ran.
import { useEffect } from 'react'
import {
    consoleAdapter,
    getAnalyticsAdapter,
    setAnalyticsAdapter,
    type AnalyticsAdapter,
    type AnalyticsEvent,
} from '@/shared/analytics'
import { createClarityAdapter } from '@/shared/analytics/clarity-adapter'
import { createFanoutAdapter } from '@/shared/analytics/fanout-adapter'
import { createFirebaseAdapter } from '@/shared/analytics/firebase-adapter'
import { initClarity, isClarityConfigured } from '@/shared/clarity'
import { initFirebase } from '@/shared/firebase/client'
import { isFirebaseConfigured } from '@/shared/firebase/config'
import { getRemoteConfigString } from '@/shared/firebase/remote-config'

// Cap the pre-init buffer; the funnel emits ~16 events end to end, so 50 is
// generous headroom without growing unbounded if init never completes.
const BUFFER_CAP = 50

// Idle fallback for browsers without requestIdleCallback (Safari).
const IDLE_FALLBACK_MS = 3000

export function AnalyticsBootstrap() {
    useEffect(() => {
        if (!isFirebaseConfigured() && !isClarityConfigured()) return

        // Install the buffering adapter only over the default console sink —
        // if E2E already swapped in a capturing adapter, leave it alone.
        if (getAnalyticsAdapter() !== consoleAdapter) return

        const buffered: AnalyticsEvent[] = []
        const bufferingAdapter: AnalyticsAdapter = {
            track(event: AnalyticsEvent): void {
                consoleAdapter.track(event)
                if (buffered.length < BUFFER_CAP) buffered.push(event)
            },
        }
        setAnalyticsAdapter(bufferingAdapter)

        let started = false
        let idleHandle: number | undefined
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined

        const removeTriggers = () => {
            window.removeEventListener('pointerdown', start)
            window.removeEventListener('keydown', start)
            // cancelIdleCallback is always paired with requestIdleCallback, and
            // idleHandle is only set when the latter exists (symmetry below).
            if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle)
            if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
        }

        async function boot(): Promise<void> {
            const sinks: AnalyticsAdapter[] = []
            if (isFirebaseConfigured()) {
                const services = await initFirebase()
                if (services?.analytics) {
                    sinks.push(createFirebaseAdapter(services.analytics, services.logEvent))
                }
            }
            // Clarity boots after Firebase so the Remote Config kill switch can
            // veto it — initFirebase() awaits Remote Config activation, which
            // applies values cached by the previous session's fetch. Only an
            // explicit 'false' disables; the default and missing-RC paths run
            // (so when Firebase is unconfigured, the switch is permanently open
            // and Clarity runs unconditionally).
            if (isClarityConfigured() && getRemoteConfigString('clarity_enabled') !== 'false') {
                const clarity = await initClarity()
                if (clarity) sinks.push(createClarityAdapter(clarity))
            }
            // Reference guard — serves double duty: (1) yields to an E2E
            // capturing adapter installed meanwhile, and (2) makes a
            // StrictMode re-mount / Safari timeout-after-cleanup a no-op,
            // since cleanup restored consoleAdapter so this closure's
            // bufferingAdapter is no longer active. Keep this check if the
            // adapter ever moves out of closure scope.
            if (getAnalyticsAdapter() !== bufferingAdapter) return
            if (sinks.length > 0) {
                const adapter = createFanoutAdapter(sinks)
                setAnalyticsAdapter(adapter)
                buffered.forEach((event) => adapter.track(event))
            } else {
                // No backend came up (blocked, unsupported, disabled) — restore
                // the plain console sink and stop buffering.
                setAnalyticsAdapter(consoleAdapter)
            }
        }

        function start(): void {
            if (started) return
            started = true
            removeTriggers()
            // initFirebase() already swallows SDK failures; this catch covers
            // unexpected synchronous throws in the adapter swap itself.
            boot().catch((error: unknown) => {
                console.warn('[analytics] bootstrap failed', error)
                if (getAnalyticsAdapter() === bufferingAdapter) {
                    setAnalyticsAdapter(consoleAdapter)
                }
            })
        }

        // Load on idle, or on first interaction — whichever comes first. The
        // interaction path covers test_start fired before idle on slow devices.
        if (typeof window.requestIdleCallback === 'function') {
            idleHandle = window.requestIdleCallback(start)
        } else {
            timeoutHandle = setTimeout(start, IDLE_FALLBACK_MS)
        }
        window.addEventListener('pointerdown', start, { once: true, passive: true })
        window.addEventListener('keydown', start, { once: true, passive: true })

        return () => {
            removeTriggers()
            // StrictMode runs this effect twice in dev: restore the console sink
            // on cleanup so the re-run sees the pristine adapter and the guard
            // above behaves identically (no stacked buffering adapters).
            if (getAnalyticsAdapter() === bufferingAdapter) {
                setAnalyticsAdapter(consoleAdapter)
            }
        }
    }, [])

    return null
}
