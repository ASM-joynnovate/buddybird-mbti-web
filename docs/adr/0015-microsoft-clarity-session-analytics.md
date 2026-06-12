---
status: accepted
---

# Session analytics: Microsoft Clarity fan-out beside Firebase GA4

Every typed event in `shared/analytics/events.ts` now also lands in **Microsoft
Clarity** (session recordings, heatmaps, frustration signals) alongside Firebase
GA4 (ADR-0011). The adapter slot stays single-sink: the bootstrap installs a
**fan-out adapter** (`shared/analytics/fanout-adapter.ts`) over whichever sinks
came up — GA4, Clarity, or both — so UI code keeps calling `track()` and gains
Clarity coverage for free across all ~20 instrumented events.

Clarity rides the **same idle/first-interaction trigger** as Firebase in
`AnalyticsBootstrap` (`shared/analytics/analytics-bootstrap.tsx`) — the former
`FirebaseBootstrap`, moved out of `shared/firebase` and renamed when it became
the cross-backend boot point, keeping the dependency direction one-way
(`shared/analytics` → `shared/firebase` + `shared/clarity`). The
`@microsoft/clarity` npm wrapper is tiny
(~9 kB unpacked, dynamically imported); `Clarity.init()` synchronously installs
a queueing stub (`window.clarity`) and loads the real tracker from `clarity.ms`
async, so post-init calls are never lost. All runtime `@microsoft/clarity`
imports live in `shared/clarity/client.ts` — everywhere else imports types only,
mirroring the `shared/firebase` rule.

Division of labor — the npm wrapper's `event()` takes a **name only**:

- **GA4**: parameter-level analysis (`question_id`, drop-off by `index`, …).
- **Clarity**: event names on the session timeline + session-level tags
  (`parrot_type`, `visitor`) for filtering recordings, and `upgrade()` on
  `test_completed` / `share_success` / `share_error` / `result_error` so funnel
  outcomes and failure sessions are always fully captured despite sampling.

Configuration is one env var, `NEXT_PUBLIC_CLARITY_PROJECT_ID`; when missing the
whole module is dormant (zero imports), same contract as Firebase. A **Remote
Config kill switch** (`clarity_enabled`, default `'true'`) lets us stop new
sessions from booting Clarity without a deploy — Clarity intentionally boots
_after_ `initFirebase()` so the previously-fetched RC value can veto it; only an
explicit `'false'` disables, so Firebase-less builds still run Clarity.

## Considered Options

- **`@microsoft/clarity` npm wrapper, lazy fan-out (chosen)** — official package,
  trivially small, reuses the buffering/idle bootstrap and the adapter contract;
  limitation: no event parameters (acceptable — GA4 owns parameters).
- **Raw script tag in `app/layout.tsx`** — same tracker, but loads eagerly in
  `<head>`, competing with the LCP canopy image; no typed integration with the
  event dictionary.
- **GA4 only (status quo)** — numbers without pictures: funnel ratios exist but
  _why_ users drop at question N or rage-tap the share sheet stays invisible.
- **Replay vendors (Hotjar/PostHog/LogRocket)** — paid tiers or heavier SDKs;
  Clarity is free with unlimited recordings and ships first-class GA linkage.

## Consequences

- **The adapter contract is unchanged.** `clarity-adapter.ts` follows the
  firebase-adapter precedent: not re-exported from the analytics barrel, only
  the bootstrap constructs it. E2E capturing adapters still win via the existing
  reference guards (the fan-out is only installed over the buffering adapter).
- **Privacy: the pet photo is double-protected.** Clarity replays load images
  from their original URLs, and the photo is a `blob:` URL that only ever
  existed on-device — unplayable by Clarity's servers. Both photo `<img>`s
  (`features/share/photo-input.tsx`, `features/result/result-polaroid/`) also
  carry `data-clarity-mask="True"` so not even the region geometry leaks. The
  PRD promise "photos never leave the device" holds.
- **Cookies without a consent banner (decided 2026-06-11):** Clarity sets
  `_clck`/`_clsk` first-party cookies under the same default-collection stance
  as GA4 (ADR-0011 PIPA note). Mitigations: the RC kill switch, Clarity's
  built-in IP masking, and the same upgrade path — gate `boot()` behind a
  consent banner if consent gating becomes required.
- **Performance:** nothing new on the critical path. The wrapper joins the lazy
  analytics flow; the ~70 kB tracker loads async from `clarity.ms` after idle or
  first interaction. Verify with the h2 Lighthouse protocol after deploy.
- **GA4 ↔ Clarity linkage is dashboard work, not code:** connect Google
  Analytics in Clarity settings (Settings → Setup → Google Analytics
  integration) so GA4 sessions carry recording playback URLs.
- **Ad blockers** that block `clarity.ms` leave a queueing stub that drops
  events silently; GA4 fan-out is unaffected. Expect Clarity capture ≤ GA4
  capture; read absolute counts from GA4 only.
- **Deploy checklist gains one step:** set `NEXT_PUBLIC_CLARITY_PROJECT_ID` in
  compose `build.args` → Dockerfile `ARG`/`ENV` (same flow as the Firebase
  vars, see `docs/deploy.md`) and verify a recording appears after deploy.
