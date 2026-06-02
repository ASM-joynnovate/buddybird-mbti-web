// E2E interception seam.
// Exposes a window-scoped capture buffer and an installer so an E2E harness can,
// from the browser, swap the active adapter for one that records every emitted
// event into window.__analyticsEvents.
//
// This is harmless in production: capture only begins when window.__setAnalyticsAdapter
// is explicitly invoked. Until then the default console adapter stays in place. The
// installer is guarded by a typeof window check so it is a no-op (and tree-shakeable)
// in non-browser environments.

import type { AnalyticsAdapter, AnalyticsEvent } from '@/lib/analytics'
import { setAnalyticsAdapter } from '@/lib/analytics/adapter'

declare global {
    interface Window {
        __analyticsEvents?: AnalyticsEvent[]
        __setAnalyticsAdapter?: () => void
    }
}

// Wire up the browser-side capture buffer and installer. Calling
// window.__setAnalyticsAdapter() installs a capturing adapter that pushes each
// event into window.__analyticsEvents.
export function installAnalyticsTestHook(): void {
    if (typeof window === 'undefined') {
        return
    }

    window.__analyticsEvents = window.__analyticsEvents ?? []

    window.__setAnalyticsAdapter = () => {
        const capturingAdapter: AnalyticsAdapter = {
            track(event: AnalyticsEvent): void {
                // Read the buffer off window each time so it survives external reassignment.
                window.__analyticsEvents = window.__analyticsEvents ?? []
                window.__analyticsEvents.push(event)
            },
        }

        setAnalyticsAdapter(capturingAdapter)
    }
}
