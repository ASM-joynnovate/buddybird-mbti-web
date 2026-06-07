---
status: accepted
---

# Feature-based folder structure (features/ · shared/ · lib/)

The original layout kept a flat `components/` (route-specific, app-wide, and
design-system files in one layer) and a domain-split `lib/`. Two systems are
expected to be **completely replaceable**: the forest background world and the
design system. A flat `components/` gave neither a boundary to swap behind.

## Decision

Adopt the "split project files by feature" strategy from the Next.js
project-structure guide:

- **`features/`** — screen and capability modules:
  `intro` (hero composition), `deck` (back stack, scrub overlay, detail
  popup), `quiz` (test progress state), `result` (result view, axis bars,
  match cards, confetti), `share` (photo source, canvas card pipeline, share
  button), `app-install` (store CTA + deep link).
- **`shared/`** — cross-feature systems, each one a swappable unit:
    - `shared/ui` — the design-system primitives (game-button, trading-card, …).
      Replacing the design system means replacing this folder plus the `@theme`
      tokens in `app/globals.css`.
    - `shared/forest` — the background world (static layers + animated decals).
      Replacing the backdrop means replacing this folder and its mount in
      `app/layout.tsx`.
    - `shared/motion` — motion vocabulary, LazyMotion provider, reduced-motion
      hook.
    - `shared/analytics` — client event pipeline.
- **`lib/`** — pure domain logic only (`mbti` engine, `result-url` codec).
  No React, no DOM.
- **`app/`** — thin route shells (page/layout/api), global CSS, metadata.

Dependency direction: `app → features → shared/lib/content`; features must
not import other features except through their public entry (the only current
case: `intro`/`result` use `features/deck`'s detail popup and controller).

Multi-unit files split into folders with an `index.ts` barrel as the public
entry (`features/deck/deck-overlay/`); single-file modules stay barrel-less
and are imported by path.

## Rejected

- **Route colocation (`app/_intro`, `app/result/_components`)** — the shared
  deck/detail-popup pieces would still need a third home, and the swappable
  systems (forest, ui) gain nothing from living under `app/`.
- **`src/` folder** — orthogonal to the goal; skipped to keep `@/*` → `./*`
  and the `@/public/...` static image imports unchanged.

## Consequences

- Background or design-system replacement is a folder swap with a stable
  import surface (`@/shared/forest/...`, `@/shared/ui/...`).
- `lib/` regains a strict meaning (pure functions, unit-testable without DOM).
- Import paths changed project-wide (pure `git mv` + path rewrite; verified
  by tsc, next build, and the e2e flows).
