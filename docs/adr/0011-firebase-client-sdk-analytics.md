---
status: accepted
---

# Analytics backend: lazy-loaded Firebase client SDK (GA4 + Performance + Remote Config)

The seven funnel events defined in `shared/analytics/events.ts` now ship to
**Firebase Analytics (GA4)** through the existing adapter slot, with **Performance
Monitoring** (automatic page-load/network collection) and **Remote Config** (copy
experiments, first surface: the result-page app CTA label) riding the same SDK.
Everything stays **client-side emission only** — this is the implementation of the
"no analytics backend (client event emission only)" stance in ADR-0002, not a
revision of it: there is still no server storage, no database, and photos never
leave the device.

The SDK is loaded **entirely off the critical path**. The only main-bundle
addition is a ~1 kB null-render `<FirebaseBootstrap />` in the root layout, which
installs a buffering analytics adapter on mount and dynamically imports the
Firebase chunk on `requestIdleCallback` (Safari fallback: 3 s timeout) or first
interaction — whichever fires first — then swaps in the GA4 adapter and flushes
the buffer. All runtime `firebase/*` imports live in `shared/firebase/client.ts`
and `shared/firebase/remote-config.ts`; everywhere else imports types only. This
protects the Lighthouse mobile 93+ / TBT < 200 ms budget the project just earned.

Configuration comes from seven `NEXT_PUBLIC_FIREBASE_*` env vars (public
identifiers, not secrets), inlined at build time. **When any are missing the whole
integration is a no-op** — the console adapter keeps working, E2E and local builds
need no setup, and `next build` prints a warning so a misconfigured deploy is
noticeable. On the server the values flow through compose `build.args` →
Dockerfile `ARG`/`ENV` in the builder stage (see `docs/deploy.md`).

## Considered Options

- **Firebase JS SDK, lazy-loaded (chosen)** — one SDK gives GA4 events, real-user
  performance metrics, and Remote Config with console-driven A/B experiments
  (activation event `test_completed`, goal metric `app_cta_click`) without extra
  vendors; cost is a ~60–80 kB gzip chunk, mitigated by idle-time loading.
- **GA4 via gtag.js / @next/third-parties** — lighter for events alone, but no
  Remote Config; copy experiments would need a second vendor or redeploys.
- **Amplitude / Mixpanel** — stronger product analytics, but funnel needs here are
  simple, and the team wants Firebase's experiment tooling; paid tiers loom.
- **Keep the console stub** — free, but the viral funnel (share → install) cannot
  be measured at all, which defeats the product goal.

## Consequences

- **The adapter contract is unchanged.** UI code still calls `track()`; the GA4
  sink (`shared/analytics/firebase-adapter.ts`) maps payload keys to snake_case
  (`questionId` → `question_id`, `type` → `parrot_type`). Event names transfer
  1:1 (verified against the GA4 reserved-name list). E2E capturing adapters
  always win over the Firebase swap via reference guards in the bootstrap.
- **New `shared/firebase/` module** owns the SDK lifecycle (config, lazy client,
  bootstrap, remote config). `shared/analytics` gained ergonomic wrappers
  (`useTrack`, `useTrackEvent`, `withTrack`) typed off the event union.
- **CTA copy moved** from `features/app-install/app-cta.ts` to `content/cta.ts`
  (re-exported for compatibility) so `shared/firebase` can use it as the Remote
  Config default without importing `features/`.
- **Remote Config uses activate-then-fetch:** previously fetched values apply
  instantly (no flicker), fresh values arrive for the next session. The intro CTA
  deliberately stays on static copy — it renders too early to swap safely.
- **Collection is best-effort.** Ad blockers / private browsing reject GA
  (`isSupported()` + catch → null); expect roughly 70–85 % capture and read
  funnels as ratios, not absolutes.
- **Privacy (PIPA):** GA4 begins setting cookies/device identifiers. MVP ships
  with a privacy-notice page and default collection; Google Signals stays OFF and
  data retention is set to 2 months in the GA console. Upgrade path if consent
  gating becomes required: move the `initFirebase()` call behind a consent
  banner — the lazy architecture makes this a one-line change.
- **Builds without env are valid** (analytics off, warning printed). The deploy
  checklist gains one step: verify events in GA4 Realtime after each deploy.
