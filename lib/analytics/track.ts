// Public tracking facade. UI code imports only this function and never touches the
// adapter directly, keeping the call sites decoupled from the active sink.

import { getAnalyticsAdapter } from '@/lib/analytics/adapter'
import type { AnalyticsEvent } from '@/lib/analytics/events'

// Emit a typed analytics event through the currently active adapter.
export function track(event: AnalyticsEvent): void {
    getAnalyticsAdapter().track(event)
}
