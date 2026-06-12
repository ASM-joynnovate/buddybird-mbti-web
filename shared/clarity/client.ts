// Lazy Microsoft Clarity SDK lifecycle (ADR-0015). The only runtime
// @microsoft/clarity import in the app lives inside initClarity() below, so the
// wrapper ships in the lazy analytics chunk and never enters the main bundle.
// Clarity.init() injects a queueing stub (window.clarity) synchronously and
// loads the real tracker from clarity.ms async — calls made after init() are
// queued safely even before the remote script arrives. Calls would throw before
// init() (no stub yet), which is why consumers only receive this client AFTER
// init resolves, and every method is wrapped defensively: injectScript swallows
// injection failures, leaving window.clarity undefined.

import { getClarityProjectId } from '@/shared/clarity/config'

// The Clarity surface handed to consumers (the analytics adapter) so they never
// import @microsoft/clarity themselves. identify/consent are deliberately
// omitted: the service is anonymous (no user ids) and consent is the default
// cookie behavior per ADR-0015.
export interface ClarityClient {
    // Named custom event on the session timeline.
    event(name: string): void
    // Session-level tag for filtering recordings in the dashboard.
    setTag(key: string, value: string): void
    // Prioritize this session for full capture regardless of sampling.
    upgrade(reason: string): void
}

// Lazy singleton: the first caller kicks off initialization, everyone else
// awaits the same promise. Resolves to null when Clarity is unconfigured or
// init throws — callers treat null as "session analytics stays off".
let initPromise: Promise<ClarityClient | null> | null = null

export function initClarity(): Promise<ClarityClient | null> {
    if (!initPromise) {
        initPromise = init().catch(() => null)
    }
    return initPromise
}

async function init(): Promise<ClarityClient | null> {
    if (typeof window === 'undefined') return null
    const projectId = getClarityProjectId()
    if (!projectId) return null

    const { default: Clarity } = await import('@microsoft/clarity')
    Clarity.init(projectId)

    // init() installs the stub synchronously; if it is absent the injection
    // failed and Clarity is dead — report null so the bootstrap skips the sink.
    // (window.clarity is the tracker's own global, not in lib.dom — hence the
    // local structural cast.)
    if (typeof (window as { clarity?: unknown }).clarity !== 'function') return null

    // The stub can still disappear later in exotic cases (extensions deleting
    // globals), so each call stays guarded — analytics is best-effort and must
    // never break the app.
    return {
        event(name: string): void {
            try {
                Clarity.event(name)
            } catch {
                // Stub absent — drop silently.
            }
        },
        setTag(key: string, value: string): void {
            try {
                Clarity.setTag(key, value)
            } catch {
                // Stub absent — drop silently.
            }
        },
        upgrade(reason: string): void {
            try {
                Clarity.upgrade(reason)
            } catch {
                // Stub absent — drop silently.
            }
        },
    }
}
