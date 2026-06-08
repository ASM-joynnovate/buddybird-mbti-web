---
status: accepted
---

# Tailwind-only styling policy (one stylesheet, Motion-owned animation)

The 동화숲 v2 rebuild replaced every screen's presentation. Before it, styling
lived in 9 CSS files (~1,400 lines) of hand-written component classes that the
Tailwind v4 `@theme` tokens only partially fed; reuse happened through class
names (`.game-btn`, `.game-panel`, `.chip`, `.modal*`) whose consumers were
hard to trace.

## Decision

- **`app/globals.css` is the ONLY stylesheet**, and it contains exactly:
  `@import 'tailwindcss'`, the `@theme` token block, and the `body` base.
  No `@layer`, no `@utility`, no component classes, no keyframes.
- **Styling is inline Tailwind utilities on components.** Reuse happens
  through the **`components/ui/` primitive layer** (GameButton, GamePanel,
  GamePill, PortraitWindow, DashedRule, TradingCard, CardGhost), not through
  shared CSS classes. Primitives keep variant→class maps as FULL class
  strings (prettier-plugin-tailwindcss compatible; conditional fragments are
  banned).
- **Every animation is Motion-owned** (`m.*`, MotionValues, AnimatePresence,
  standalone `animate()` for MotionValue snaps). The last CSS keyframe
  (`confetti-fall`) is gone; idle loops (holo sweep, bob, CTA pulse, hint
  chevron) are `m.*` infinite tweens dropped under reduced motion.
- **DESIGN.md v2 is the token norm; values are solid hex.** The derived
  `color-mix` chrome (`primary-glow`, `border-action`, `depth-action`) was
  replaced by the DESIGN.md literals; the raised-block depth language became
  named `--shadow-*` recipes (`raise-primary(-down)`, `raise-cream(-down/-sm)`,
  `raise-panel`, `card-frame(-sm)`, `window`, `ghost`, `inset-track`).
- **Rounded scale changes meaning** (breaking for class semantics): `sm` 12 /
  `md` 16 / `lg` 20 / `card` 24 / `panel` 26 (DESIGN.md vocabulary). `md`/`lg`
  are now SMALLER than the previous 20/24 — any `rounded-md`/`rounded-lg`
  written against the old scale renders tighter.
- **Token slim**: the `:root` bundle-alias block, `group-*` (→ `faction-*`),
  `foliage-*`, the lime/leaf/semantic accent set, `surface`/`surface-sunken`/
  `outline`/`error`, leaf shadows, `radius-xl`, and the `--duration-*` tokens
  are deleted. Durations live only in `lib/motion/variants.ts` — with no CSS
  animations left there is nothing to mirror.

## Considered Options

- **Tailwind-only + component primitives (chosen)** — consumers are imports,
  so reuse is grep-able and type-checked; dead styles cannot accumulate
  invisibly; one source of truth for the raised-block recipe per primitive.
- **Keep the component-class layer fed by @theme** — familiar, but class
  consumers are stringly-typed, the cascade fights Motion over `transform`,
  and the 9-file split already drifted from DESIGN.md once.
- **CSS Modules per component** — solves tracing but keeps a second styling
  language and per-file plumbing; the design system's reuse unit here is the
  React primitive, not the stylesheet.

## Consequences

- `app/globals.css` went from 729 to ~147 lines; `page.css`, `test.css`,
  `result.css`, `dex.css`, `type-showcase.css`, `axis-bars.css`,
  `photo-input.css`, `confetti.css`, and `mobile-forest-background.css` are
  deleted.
- New surfaces MUST style inline (or extend a `components/ui/` primitive) and
  animate via Motion; adding a CSS class or keyframe to globals.css is a
  policy violation, not a convenience.
- Long utility strings are accepted as the cost of traceability; shared
  recipes belong in a primitive the moment a second consumer appears.
- **Arbitrary _property_ utilities (`[prop:value]`) are the narrow escape hatch**
  for effects with no standard Tailwind class — and `@utility`/`@layer` are
  banned here, so a custom utility is not an option. Allowed cases: gradients,
  masks, shadows, dynamic CSS vars, and (currently only in
  `features/result/emphasize.tsx`) `[box-decoration-break:clone]` +
  `[-webkit-box-decoration-break:clone]`, which repaints the marker highlighter
  stroke per line when the emphasized text wraps — load-bearing, not decorative,
  and the `-webkit-` prefix is required on iOS Safari.
- ADR-0006's token-layer description is superseded where it conflicts (its
  motion/LazyMotion decisions still stand).
