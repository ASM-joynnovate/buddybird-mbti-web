---
version: alpha
name: 동화숲 월드 (Fairytale Forest World)
description: >-
    A playful, game-like mobile design system for the Parrot MBTI test. Warm cream
    parchment surfaces sit over a low-poly fairytale forest, and a single bell-orange
    accent drives every action. Depth is conveyed through a tactile "raised block"
    language — a colored bottom depth-bar, a soft drop shadow, and an inset top
    highlight — so buttons, cards, chips and badges all feel pressable like game UI.
colors:
    primary: '#e8772e'
    primary-hover: '#c85f1e'
    primary-active: '#a84e16'
    primary-soft: '#ffe2c8'
    primary-glow: '#f9b277'
    border-action: '#f0b486'
    depth-action: '#e7a06a'
    on-primary: '#ffffff'
    gold: '#e8b53a'
    surface: '#fbf3df'
    surface-cream: '#fff8e3'
    on-surface: '#2a2118'
    on-surface-muted: '#6b6150'
    faction-analyst: '#7b3fb5'
    faction-diplomat: '#e0568f'
    faction-sentinel: '#3e8fd0'
    faction-explorer: '#e08a2c'
# Lengths are rem (ADR-0009); px noted in comments. Sizes sit on the default
# Tailwind scale (text-xs/sm/base/lg/xl/2xl, 4px spacing grid).
typography:
    display:
        fontFamily: Jua
        fontSize: 2.875rem # 46px
        fontWeight: 400
        lineHeight: 1.08
    headline-lg:
        fontFamily: Jua
        fontSize: 1.75rem # 28px
        fontWeight: 400
        lineHeight: 1.1
        letterSpacing: 0.05em # tracking-wider
    headline-md:
        fontFamily: Jua
        fontSize: 1.25rem # 20px (text-xl)
        fontWeight: 400
        lineHeight: 1.15
    title-action:
        fontFamily: Jua
        fontSize: 1.5rem # 24px (text-2xl)
        fontWeight: 400
        lineHeight: 1.2
    question:
        fontFamily: Jua
        fontSize: 1.5rem # 24px (text-2xl)
        fontWeight: 400
        lineHeight: 1.4
    label-lg:
        fontFamily: Jua
        fontSize: 1rem # 16px (text-base)
        fontWeight: 400
        lineHeight: 1
        letterSpacing: 0.05em # tracking-wider
    body-lg:
        fontFamily: Noto Sans KR
        fontSize: 1rem # 16px (text-base)
        fontWeight: 400
        lineHeight: 1.6
    choice-hook:
        fontFamily: NEXON Lv2 Gothic
        fontSize: 1.0625rem # 17px
        fontWeight: 700
        lineHeight: 1.375 # leading-snug
    choice-body:
        fontFamily: NEXON Lv2 Gothic
        fontSize: 0.875rem # 14px (text-sm)
        fontWeight: 400
        lineHeight: 1.5
    body-md:
        fontFamily: Noto Sans KR
        fontSize: 0.875rem # 14px (text-sm)
        fontWeight: 500
        lineHeight: 1.5
    body-sm:
        fontFamily: Noto Sans KR
        fontSize: 0.875rem # 14px (text-sm) — distinguished from body-md by weight
        fontWeight: 400
        lineHeight: 1.5
    caption:
        fontFamily: Noto Sans KR
        fontSize: 0.75rem # 12px (text-xs)
        fontWeight: 700
        lineHeight: 1.3
rounded:
    sm: 0.75rem # 12px
    md: 1rem # 16px
    lg: 1.25rem # 20px
    card: 1.5rem # 24px
    panel: 1.625rem # 26px
    full: 999px # pill
spacing:
    xs: 0.25rem # 4px
    sm: 0.5rem # 8px
    md: 0.875rem # 14px
    lg: 1.25rem # 20px
    xl: 2rem # 32px
    screen-padding: 1.375rem # 22px — the one off-grid value, kept as the gutter token
    stack-gap: 0.875rem # 14px
    card-padding: 1rem # 16px
components:
    button-primary:
        backgroundColor: '{colors.primary}'
        textColor: '{colors.on-primary}'
        typography: '{typography.title-action}'
        rounded: '{rounded.full}'
        padding: 1rem 2.5rem # 16px 40px
        height: 3.5rem # 56px
    button-primary-active:
        backgroundColor: '{colors.primary-active}'
    button-secondary:
        backgroundColor: '{colors.surface-cream}'
        textColor: '{colors.primary-active}'
        typography: '{typography.label-lg}'
        rounded: '{rounded.full}'
        padding: 0.75rem 1.25rem # 12px 20px
        height: 2.75rem # 44px
    card-trading:
        backgroundColor: '{colors.surface-cream}'
        textColor: '{colors.on-surface}'
        rounded: '{rounded.card}'
        padding: 0.375rem # 6px
    choice-outline:
        backgroundColor: '{colors.surface-cream}'
        textColor: '{colors.on-surface}'
        typography: '{typography.choice-body}' # hook line uses {typography.choice-hook}
        rounded: '{rounded.lg}'
        padding: 0.875rem 1rem # 14px 16px
    choice-outline-selected:
        backgroundColor: '#fff7ec'
        textColor: '{colors.on-surface}'
    chip:
        backgroundColor: '{colors.primary}'
        textColor: '{colors.on-primary}'
        typography: '{typography.label-lg}'
        rounded: '{rounded.full}'
        padding: 0.25rem 0.875rem # 4px 14px
    close-button:
        backgroundColor: '{colors.surface-cream}'
        textColor: '{colors.primary-active}'
        rounded: '{rounded.full}'
        size: 2.5rem # 40px
    progress-track:
        backgroundColor: '{colors.surface-cream}'
        rounded: '{rounded.full}'
        height: 1rem # 16px
    progress-fill:
        backgroundColor: '{colors.primary}'
        rounded: '{rounded.full}'
---

# 동화숲 월드 — Parrot MBTI Design System

## Overview

동화숲 월드 ("Fairytale Forest World") is the visual identity for a playful parrot
MBTI personality test delivered as a mobile app. The mood is **cozy, tactile, and
game-like** — closer to a cute mobile collection game than a utilitarian form. Every
surface is warm cream parchment floating over a hand-painted low-poly forest, and the
entire interface is anchored by **one** energetic accent: bell orange.

The defining trait of the system is its **raised-block depth language**. Buttons, cards,
chips, badges and panels all share the same recipe: a solid bottom _depth bar_ in a
darker shade, a soft ambient drop shadow, and an inset top highlight. Pressing an element
translates it down and shrinks its depth bar, so the whole UI feels physically pressable —
like buttons on a toy. This tactility is the brand; preserve it on every new component.

Target audience: casual consumers (mobile-first, Korean-language) looking for a fun,
shareable personality quiz. The emotional response should be **delight and warmth** —
inviting, soft-cornered, never clinical. When a rule is undefined, choose the more
playful, rounder, warmer option.

## Colors

The palette is a single evocative accent over warm neutrals, with a forest-derived
secondary set used only for personality-group identity.

- **Primary — Bell Orange (#e8772e):** The sole driver of action and emphasis. Used for
  primary buttons, the depth bars and borders of all game chrome, selection states,
  badges, chips, and progress fills. `primary-hover (#c85f1e)` and
  `primary-active (#a84e16)` are the darker family members used for hover and for the
  pressed depth bar.
- **Primary Soft / Glow (#ffe2c8 / #f9b277):** Tints used for focus rings, CTA halos, and
  the lighter stop of orange gradients.
- **Border & Depth Action (#f0b486 / #e7a06a):** Softened orange used for the resting
  borders and depth bars of cream surfaces, so chrome reads as part of the orange family
  without shouting.
- **Surface — Warm Cream (#fff8e3) on Parchment (#fbf3df):** Cream is the foundation for
  all foreground cards and chrome; parchment is the page/overlay base. Both are warmer and
  friendlier than white.
- **Gold (#e8b53a):** A festive companion to orange, used in highlight underlines and
  progress gradients — never for primary actions.
- **Ink (#2a2118 / muted #6b6150):** Warm near-black for text and a muted brown for
  secondary copy.
- **Faction accents (analyst #7b3fb5, diplomat #e0568f, sentinel #3e8fd0,
  explorer #e08a2c):** Reserved exclusively for the four MBTI temperament groups. They
  identify content; they are **not** part of the action system and never style buttons.

## Typography

Two families carry the system — **Jua** (a rounded, friendly Korean display face) for
everything expressive, and **Noto Sans KR** for readable body copy — plus one
scoped guest: **NEXON Lv2 Gothic**, used exclusively for Choice copy (hook +
body) on the Test screen, where it brings game-brand personality while staying
legible at 14px over long lines. The per-screen two-family rule holds: Test
shows Jua + NEXON Lv2 Gothic. License note: NEXON fonts may be embedded but
**must ship unmodified — never subset the files**.

- **Display / Headlines / Titles (Jua):** All headlines, MBTI codes, the hero title,
  question text, button labels, counts and badges are set in Jua at weight 400. Jua's soft
  geometry is the voice of the brand — warm and toy-like. Apply the `.font-display` class
  (or `--title-font`) for these.
- **Body (Noto Sans KR):** Descriptions, choice copy, and metadata use Noto Sans KR.
  `body-lg` (16px) for primary reading, `body-md` (14px, medium) for choices, `body-sm`
  (14px, regular) for card blurbs and captions.
- **Korean wrapping:** Long Korean strings use `word-break: keep-all` and
  `text-wrap: balance` so names and questions break on word boundaries, never mid-syllable.
- The hero title (`--title-font`) is user-tweakable across Jua / Black Han Sans / Do Hyeon /
  Gaegu, but **Jua is canonical**.

## Layout

A **single-column, mobile-first** layout inside a 402px-wide phone frame. Content is
governed by a strict **22px global side padding** — every primary surface (hero content,
question card, choice list, detail modal) spans the full width minus 22px on each side.
New full-width elements must honor this 22px gutter so left/right edges stay flush across
screens.

Vertical rhythm uses a small set of gaps: **14px** between stacked siblings (choices, hero
groups), **16px** internal card padding, and larger **22–32px** separations between major
regions. The hero pins its title group to the top (clear of the forest canopy art) and its
CTA group to the bottom via `margin-top: auto`. Overlays (full-screen deck, detail modal)
are absolutely positioned **inside the phone screen only** and never affect the underlying
layout.

## Elevation & Depth

Depth is the signature of this system and is expressed through a **tactile raised-block**
recipe rather than soft material shadows. Every interactive/contained element layers:

1. a solid **bottom depth bar** — `box-shadow: 0 Npx 0 {depth color}` — in a darker shade
   of its own color (orange surfaces use `depth-action`; the primary button uses
   `primary-active`);
2. a **soft ambient drop shadow** below for grounding;
3. an **inset top highlight** (`inset 0 2px 0` light) for a glossy lip.

The depth bar height scales with the `--depth` token (default ×1). On `:active`/selected,
the element translates down by the depth amount and the bar shrinks — producing a physical
"press." Cards stack their upcoming siblings as offset, scaled ghost layers behind the
active card to imply a deck. Avoid flat, shadowless elements and avoid generic blurry
material shadows — they break the toy-like feel.

## Shapes

The shape language is **soft and rounded** throughout — there are no sharp corners.

- **Pills (999px)** for buttons, chips, badges, counts, and progress tracks.
- **Cards (24px)** for trading cards and the detail modal; **Panels (26px)** for larger
  surfaces.
- **lg (20px)** for choice rows, **md (16px)** for inset windows, **sm (12px)** for small
  letter tiles.
- Portrait windows and icon tiles use 16–24px radii. Mixing sharp and round corners in one
  view is forbidden; commit fully to the rounded vocabulary.

## Components

All components inherit the raised-block depth language and the orange action family.

- **Primary Button (`button-primary`):** Bell-orange gradient pill, Jua 24px white label,
  6px `primary-active` depth bar + halo. The single most important action per screen
  (e.g. "테스트 시작하기"). Optional pulsing glow ring to draw the eye.
- **Secondary Button (`button-secondary`):** Cream pill, orange border + `depth-action`
  bar, `primary-active` text. For lower-priority actions (e.g. "16유형 모두 보기").
- **Trading Card (`card-trading`):** The hero collectible — an orange gradient frame
  wrapping a cream inner card with a gradient portrait window (holo sweep + bobbing parrot),
  MBTI code and nickname on one row, a dashed rule, and a short blurb. Always fills its
  container width.
- **Choice Row (`choice-outline`, canonical):** Cream pill-card with an **A / B letter** in
  an orange-outline rounded square at the left, and the Choice copy to the right as a
  two-line hierarchy: the **hook** punch line (NEXON Lv2 Gothic bold 17px, ink) over the
  **body** description (NEXON Lv2 Gothic 14px, muted ink). Tapping runs the "도장 쾅"
  feedback inside the 420ms auto-advance budget: a ~90ms press-in (deeper sink, depth bar
  squash), a spring rebound — the row never holds the pressed pose — while a check stamp
  slams onto the letter tile (scale 1.45→1.0, rotate −8°→−3°, back-out spring) with a
  fading ink ring; selection then reads from the stamp + orange border/tint, plus a
  one-line `navigator.vibrate(12)` haptic on Android. Reduced motion swaps states
  instantly with the same 420ms pacing.
- **Question Card (Quest Sheet):** The question presented as a parchment commission
  notice pinned to the forest — a brass pin at the top, a slight −1.2° tilt, a Jua
  "No.n" commission-number eyebrow, the question emoji as a tilted postage-stamp tile
  (dashed orange border on `primary-soft`), and the question text in Jua 24px
  left-aligned. Built on the cream panel + dashed-inner-frame recipe; the narrative
  framing (not just scale) is what gives the question its hierarchy over the forest.
- **Chip / Badge (`chip`):** Orange gradient pill, Jua label, small depth bar. Used for
  match types ("찰떡궁합"), counts, and eyebrows. Faction chips are the exception — filled
  with their faction accent.
- **Close Button (`close-button`):** 40px cream circle, orange border + `depth-action` bar,
  `primary-active` glyph. Matches game chrome; never a bare dark circle.
- **Progress Bar:** Cream pill track (orange border, inset shadow) with a gold→orange
  gradient fill that springs to its new width.
- **Detail Modal:** A full-width (minus 22px gutter) trading-card-style panel over a blurred
  forest scrim — large portrait, MBTI code, nickname, full description, a "찰떡궁합" match
  panel, and a primary CTA.

## Do's and Don'ts

- **Do** use bell orange as the only action color — one primary button per screen.
- **Do** give every button, card, chip and badge the raised-block depth recipe (depth bar +
  soft shadow + inset highlight).
- **Do** set all expressive text (titles, codes, labels, questions) in Jua, and body copy
  in Noto Sans KR.
- **Do** keep every full-width surface within the 22px global side padding.
- **Do** use `word-break: keep-all` for Korean so text never breaks mid-syllable.
- **Don't** introduce new accent colors for actions; faction colors identify content only
  and must never style buttons.
- **Don't** use sharp corners or mix them with the rounded vocabulary.
- **Don't** replace the tactile depth bars with flat fills or generic blurry material
  shadows.
- **Don't** let overlays (deck, modal) escape the phone frame or shift the underlying hero
  layout.
- **Don't** show MBTI axis tags (e.g. "E·F") on quiz choices — use plain A / B letters.
- **Don't** stack more than two type families on a screen (Jua + Noto Sans KR;
  on Test, Jua + NEXON Lv2 Gothic).
