'use client'

// Remote Config integration (ADR-0011). Strategy: activate() applies values
// fetched in a PREVIOUS session immediately (no flicker), then fetchConfig()
// refreshes in the background for the next visit. The first experiment surface
// is the result-page CTA label — users spend ~60s answering questions, so the
// idle-time init has long finished before the result screen renders.
//
// Components read values through useRemoteConfigString, which serves the static
// default until Remote Config is ready (or forever, when Firebase is off).
import { useSyncExternalStore } from 'react'
import type { FirebaseApp } from 'firebase/app'
import type { getValue, RemoteConfig } from 'firebase/remote-config'
import { APP_CTA_LABEL } from '@/content/cta'

// Every remotely configurable value with its build-time default. Add a key here
// and create the matching parameter in the Firebase console to extend.
// clarity_enabled is the Clarity kill switch (ADR-0015): set 'false' in the
// console to stop new sessions from booting session recording without a deploy.
export const REMOTE_DEFAULTS = {
    result_cta_label: APP_CTA_LABEL,
    clarity_enabled: 'true',
} as const

export type RemoteConfigKey = keyof typeof REMOTE_DEFAULTS

// Production fetch interval; dev fetches eagerly so console edits show up on
// the next reload instead of 12 hours later.
const PROD_FETCH_INTERVAL_MS = 12 * 60 * 60 * 1000

let activeConfig: RemoteConfig | null = null
let getValueFn: typeof getValue | null = null
const listeners = new Set<() => void>()

// Coarse notify: every subscriber is pinged on activation regardless of which
// key changed. Fine for the current small key surface — getSnapshot returns a
// string, so unchanged values bail out of re-render. Make this key-aware if the
// key count grows past a handful.
function emitReady(): void {
    listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

// Called from the Firebase init flow (shared/firebase/client.ts) — the dynamic
// import keeps the remote-config SDK inside the lazy Firebase chunk.
export async function initRemoteConfig(app: FirebaseApp): Promise<void> {
    try {
        const rcModule = await import('firebase/remote-config')
        const rc = rcModule.getRemoteConfig(app)
        rc.settings.minimumFetchIntervalMillis =
            process.env.NODE_ENV === 'development' ? 0 : PROD_FETCH_INTERVAL_MS
        rc.defaultConfig = REMOTE_DEFAULTS
        await rcModule.activate(rc)
        // Background refresh for the NEXT session; deliberately not awaited.
        void rcModule.fetchConfig(rc).catch(() => {})
        activeConfig = rc
        getValueFn = rcModule.getValue
        emitReady()
    } catch {
        // Remote Config unavailable — static defaults stay in effect.
    }
}

// Current value for a key: the activated remote value once ready, the static
// default before that (and always, when Firebase is disabled).
export function getRemoteConfigString(key: RemoteConfigKey): string {
    if (!activeConfig || !getValueFn) return REMOTE_DEFAULTS[key]
    // Defensive: this runs inside useSyncExternalStore's getSnapshot, where a
    // throw (e.g. a stale RemoteConfig after an HMR cycle) would crash the
    // render. The static default is always a safe answer.
    try {
        const value = getValueFn(activeConfig, key).asString()
        return value || REMOTE_DEFAULTS[key]
    } catch {
        return REMOTE_DEFAULTS[key]
    }
}

// Reactive accessor: re-renders subscribers once Remote Config activates.
export function useRemoteConfigString(key: RemoteConfigKey): string {
    return useSyncExternalStore(
        subscribe,
        () => getRemoteConfigString(key),
        () => REMOTE_DEFAULTS[key],
    )
}
