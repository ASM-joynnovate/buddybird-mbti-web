---
status: accepted
---

# Deck Overlay replaces the /dex route

The 동화숲 v2 design rebuild (DESIGN.md, prototype bundle) presents the 16-type
collection as a **full-screen overlay that scrubs open over the landing hero**,
not as a separate page. Keeping a `/dex` route alongside it would mean two
collections with two navigation models for the same content.

## Decision

- **Remove `app/dex/` entirely.** The 16-type collection is the **Deck
  Overlay** (`components/deck-overlay.tsx`), a body-portaled `fixed inset-0`
  layer mounted locally by both the Intro and the Result.
- **Open paths**: on Intro, a wheel/touch scrub on the Back Stack (one shared
  `progress` MotionValue, snap threshold 0.34) or the "16유형 모두 보기"
  button; on Result, the "도감 보기" action opens it in place. The button path
  is the deterministic one e2e drives.
- **The Type Modal is replaced by the Detail Popup**
  (`components/detail-popup.tsx`) — the bundle's trading-card design carrying
  over TypeModal's full a11y contract (dialog semantics, focus trap, Escape,
  scroll lock, focus restore). Match chips swap the popup's type instead of
  deep-linking.
- **No redirect from `/dex`** — the app is unreleased, so there are no inbound
  links to honor; `/dex` is now a plain 404. `MatchChip` (whose only job was
  the `/dex?focus=` deep link) is deleted with it; the result uses `MatchCard`
  → Detail Popup.

## Considered Options

- **Deck Overlay, no route (chosen)** — one collection surface, zero
  navigation; the overlay state lives where it is used and the result can show
  the deck without leaving the page.
- **Keep `/dex` and the overlay** — two sources of truth for the same grid;
  the route would need its own header/back affordances the design no longer
  defines.
- **`/dex` redirecting to `/` + auto-open** — preserves old URLs nobody has;
  costs a special-case query param and a flash of the hero before the overlay
  opens.

## Consequences

- Shareable deep links to one type (`/dex?focus=CODE`) no longer exist; the
  shareable artifact remains the Result URL (`/result/?t=…`), which is the
  product's actual viral loop.
- e2e: the dex flow is replaced by `e2e/flows/deck-overlay.mjs` (button open
  path only — the continuous scrub gesture is not driveable deterministically);
  the intro flow asserts tap → Detail Popup.
- The scrub introduces the standalone `animate()` import (snap animations),
  which coexists with LazyMotion `strict` — only `m.*` components are guarded.
  Measured landing first-load JS after the full rebuild: **236 KiB gzip** vs
  the 222.6 KiB pre-rebuild baseline (ADR-0006) — +13.4 KiB for standalone
  `animate()` + the deck/portal code, against the already-breached PRD budget
  (the breach remains structural, see ADR-0006).
