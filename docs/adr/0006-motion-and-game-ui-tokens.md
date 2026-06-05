---
status: accepted
---

# Motion for React adoption + "cozy forest game" UI token layer

The foreground UI is being raised from "web page over a forest backdrop" to a
**cozy forest mobile-game** read (issues #19–#27). This ADR records the three
foundation decisions that the whole pass builds on: the animation library, the
game-UI design-token layer, and the CTA color stance.

## Decision

- **Animation library: `motion` (Motion for React), imported from
  `motion/react`.** Not `framer-motion` (user decision). Raw CSS keyframes and
  hand-rolled rAF loops are no longer added for UI motion; existing keyframes
  are replaced surface-by-surface (issues #22–#25) and swept in issue #27.
- **Bundle convention: LazyMotion + `m`.** An app-wide `<MotionProvider>`
  (`components/motion-provider.tsx`, mounted in `app/layout.tsx`) loads
  `domAnimation` synchronously with `strict` enabled; components use the
  lightweight `m.*` elements. Accidental `motion.*` usage throws in
  development, so the full bundle cannot sneak back in. `domAnimation` covers
  everything this product needs (variants, exit/AnimatePresence, tap/hover
  gestures); layout animations and drag are intentionally out of scope.
- **Shared motion vocabulary: `lib/motion/`.** All variants live in one module
  (`fadeUp`, `staggerContainer`, `popIn`, `fadeOnly`, `buttonTap`,
  `sheetSlideUp`, `floatingLeaf`, `gentleSway`, `particleFloat`) with easing
  arrays mirroring the CSS tokens (`easeLeaf` = `--ease-leaf`, `easeSpring` =
  `--ease-spring`) and durations mirroring `--duration-fast/base/slow`
  (160/260/420 ms). Entrances run 0.2–0.45 s; decorative idle loops 3–7 s,
  mirrored, transform/opacity only, never on full-screen layers.
- **Reduced motion: two hooks, one convention.** Components rendering `m.*`
  elements use `useReducedMotion()` from `motion/react` (consistent with
  Motion's internals): entrances degrade to the opacity-only `fadeOnly`
  variants, and `whileTap`/idle-loop props are dropped entirely. Non-Motion
  orchestration (the carousel's auto-advance pause, the test page's 120 ms
  reduced timing) keeps `lib/hooks/use-reduced-motion.ts`. Both read the same
  media query, so the two hooks cannot disagree; replacing the local hook
  wholesale was rejected because it serves state logic, not rendering.
- **Game UI token layer in `app/globals.css` `@theme`** (one system — no
  parallel `--bb-*` namespace): lime support accent (`--color-accent`
  #AFF729, `--color-accent-deep` #518D00), game panel surfaces
  (`--color-surface-cream` #FFF8E3, `--color-surface-mint` #EAFBD8,
  `--color-surface-leaf` #DDF7B8), deep-green content ink
  (`--color-ink-forest`) + soft green border (`--color-border-leaf`), game
  semantics (reward/warning/error-soft/info), a 28 px `--radius-panel` step
  (buttons/chips keep the existing pill, cards keep `--radius-lg` 24 px),
  forest-toned elevation (`--shadow-raised-button`, `--shadow-game-card`,
  `--shadow-floating` — hard black shadows stay banned), and motion durations
  (`--duration-fast/base/slow`).
- **CTA primary stays bell orange `#e8772e`.** This _reinforces_ ADR-0001's
  single-CTA-color decision — it is not a revision. The lime/mint family is
  support only: accents, surfaces, semantic states. An action button never
  wears the lime accent.
- **Tracer slice.** The intro main CTA is the first consumer: a raised game
  button (`components/game-button.tsx` + `.game-btn--primary`) with a bottom
  depth shadow (its own pressed shade), Motion `whileTap` sink+shrink
  (`buttonTap`), and a CSS `:active` shadow squash. The full button system
  replaces `.btn`/`.btn-candy` in issue #20.

## Considered Options

- **`motion` + LazyMotion/`m` (chosen)** — declarative variants, first-class
  `AnimatePresence` exits, gesture props, and a hard guard against the full
  bundle. Measured landing first-load delta: **+31.3 KiB gzip** (vs +39.6 KiB
  with the full `motion` namespace).
- **Full `motion` namespace** — simpler imports, but +8.3 KiB more on a page
  that is already over budget, with no extra capability this product uses.
- **Keep extending CSS keyframes** — no bundle cost, but no mount/unmount
  exits (the modal needs one), no interruptible gestures, and the keyframe
  sprawl is what this pass is cleaning up.
- **GSAP / anime.js** — banned for this pass (user decision); imperative APIs
  fit React component lifecycles worse than variants do.

## Consequences

- **Bundle reality (measured, gzip, landing first-load JS):** baseline before
  motion **192.0 KiB** → with LazyMotion **222.6 KiB** (+31.3 KiB). The
  PRD's 150 kb landing budget was **already exceeded before this work** — the
  React 19 + Next 16 framework chunks alone total ≈149 KiB. The budget breach
  is therefore pre-existing and structural, not caused by motion; re-baselining
  the budget is a separate decision recorded as out of scope here. Issue #27
  re-measures and records the final number.
- Teammates/issues #20–#26 import `m` (never `motion`), reuse `lib/motion/`
  variants, and follow the reduced-motion convention above.
- The deprecated `.btn`/`.btn-candy` systems and the entrance keyframes
  (`pop`, `bounce`, `float-up`, `floaty`, `modal-fade`, `modal-in`,
  `slideInL/R`, …) are replaced per-surface and removed in issue #27 once
  grep shows zero remaining users.
- The carousel's `setInterval` + silent-reset orchestration (ADR-0005) is
  explicitly NOT migrated to Motion — it is state orchestration, and its
  motion is already compositor-friendly CSS transforms.
- DESIGN.md gains a "game UI layer" section; its stale Tropical-Jungle
  frontmatter remains a known issue (see ADR-0005) — token values keep living
  in `globals.css`.
