---
status: accepted
---

# rem tokens + default-scale snapping (no raw px in classNames)

After the 동화숲 v2 rebuild (ADR-0008), component classNames had accumulated
~120 arbitrary values (`px-[18px]`, `text-[13px]`, `rounded-[19px]`, inline
gradient strings) and several design values were duplicated across components
(the orange CTA gradient ×5, the card-frame gradient ×3, `#fffcf0` hover ×4,
bare depth-bar shadows ×2+). The values were also px-denominated, so nothing
tracked the user's root font-size preference.

## Decision

- **Snap arbitrary values to the default Tailwind scale.** Spacing/sizing
  snaps to standard integer steps (`px-[18px]` → `px-4`, `py-[9px]` → `py-2`,
  `min-h-[58px]` → `min-h-14`); typography snaps to the default type scale
  (`text-[13px]` → `text-sm`, `text-[21px]` → `text-xl`); tracking/leading
  snap to the named classes (`tracking-[0.04em]` → `tracking-wider`,
  `leading-[1.45]` → `leading-normal`). Ties round **down** (18px → 16). The
  resulting ±1–2px shifts were accepted and verified by before/after
  screenshots at 320/375/768.
- **@theme length tokens are rem** (`--radius-lg: 1.25rem` = 20px,
  `--spacing-gutter: 1.375rem` = 22px). Tailwind v4's dynamic spacing
  utilities are already rem-based (`calc(var(--spacing) * n)`), so snapped
  classes follow root font-size for free. DESIGN.md notes values as
  `rem (px)` pairs.
- **Shared values live in `@theme`, consumed 2+ times.** New tokens:
  `--gradient-cta`, `--gradient-card-frame` (plain vars, consumed via
  `bg-(image:--gradient-cta)`), `--color-cream-hover`, and the bare depth-bar
  shadows `--shadow-raise-bar-primary/-action/-action-sm` +
  `--shadow-inset-highlight`. One-off values stay inline.
- **Unavoidable arbitrary values use rem, not px** (`text-[2.75rem]` for the
  42/44px display numbers — a gap in the default scale; `max-w-[22rem]` /
  `max-w-[21.25rem]` for the hand-tuned intro card widths).
- **Documented px exceptions** (raw px stays correct):
    - box-shadow / text-shadow / drop-shadow offsets and the dashed-rule
      `repeating-linear-gradient` — hand-tuned effect hairlines that must NOT
      scale with root font size (also why @theme shadow recipes keep px);
    - border hairlines (`border-[1.5px]`, `border-[2.5px]`, `border-[3px]`) —
      chrome weight is an effect, and 1.5→2px snapping visibly thickens the
      cream outlines;
    - deck staging transforms (`translate-y-[26px]`, `scale-[0.84]`, …) —
      Motion-owned composition values, not layout;
    - `backdrop-blur-[3px]` — effect radius.
    - Unitless `leading-[0.6 … 1.2]` display values are not px and stay.

## Considered Options

- **Snap to defaults (chosen)** — zero extra tokens for type/spacing, classes
  read as vocabulary (`text-sm`, `px-4`), and the 4px rhythm matches how the
  design was meant to be read. Costs ±1–2px shifts, gated by screenshots.
- **Exact-preserving fractional classes** (`px-4.5`, `py-2.25`) — pixel-perfect
  and still rem-based, but keeps the off-grid 18/9/22px rhythm and the odd
  values it produced.
- **Semantic @theme type scale** (`--text-label` …) — consolidates but invents
  a parallel vocabulary the default scale already provides.

## Consequences

- `git grep -E '\[[0-9.]+px\]' -- components app` must only return the
  documented exceptions above; new code snaps to the scale or uses rem.
- Default type classes bring their own line-height ratios — replacements were
  screenshot-checked for wrap changes (question panel went 3→2 lines at 375,
  body copy 15→16px; accepted).
- Utility CSS shrank slightly (47,486 → 47,204 bytes raw; gzip 8,989 → 8,861).
- ADR-0008's "values are solid hex" norm now reads through rem lengths; its
  single-stylesheet policy is unchanged (gradients are plain `@theme` vars,
  not `@utility`).
