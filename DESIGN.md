---
version: 1.0
name: Parrot MBTI — Tropical Jungle
description: >-
    Visual identity for the BuddyBird Parrot MBTI viral web. A bright daylight
    tropical-jungle world on a green base, with parrot-feather accents, rounded
    organic-leaf shapes, and a "part the foliage and move forward" motion language.
    Mobile-first, single fixed theme, Korean-first. Direction and surface layout
    confirmed in the issue #03 human design review (variant C — editorial trail);
    the brand-anchor action color remains a placeholder until issue #12.

# --- COLOR TOKENS (hex; brand anchor is a placeholder until issue #12) ---
colors:
    # Action anchor — single CTA color across the whole funnel.
    # PLACEHOLDER for the BuddyBird brand color; swap in one place when confirmed (#12).
    # Deepened from raw hibiscus so white labels clear WCAG AA (4.5:1).
    primary: '#C9215E' # deep hibiscus — pops on the green base, distinct from group hues
    on-primary: '#FFFFFF'

    # Secondary / tertiary surfaces of depth (foliage greens).
    secondary: '#2E7D43' # deep leaf
    on-secondary: '#FFFFFF'
    tertiary: '#5AB45A' # mid leaf
    on-tertiary: '#10331C'

    # Base world (green family — daylight jungle, NOT cream/ivory).
    background: '#E8F4DD' # pale leaf page base
    surface: '#F4FBEC' # raised card surface (lighter leaf-white)
    surface-sunken: '#DCEFCF' # recessed wells / progress track
    on-surface: '#1A2E1F' # forest ink (green-tinted, not pure black)
    on-surface-muted: '#4C6151'
    outline: '#C2D8B0' # hairline / border on green

    # Foliage depth layers (decorative overlap + tinted shadow source).
    foliage-near: '#5AB45A'
    foliage-mid: '#2E7D43'
    foliage-deep: '#1B5E34'

    # 4 temperament-group feather accents (type identity ONLY — never on action buttons).
    group-ruby: '#E8443B' # Analyst group  (_NT_)
    group-marigold: '#F4A93C' # Diplomat group (_NF_)
    group-teal: '#15B8A0' # Sentinel group (_S_J)
    group-cobalt: '#3D7BD9' # Explorer group (_S_P)
    on-group: '#FFFFFF'

    error: '#D7263D'
    on-error: '#FFFFFF'

# --- TYPOGRAPHY TOKENS (Jua display + Pretendard body) ---
typography:
    headline-display: # result type code — the hero
        fontFamily: 'Jua'
        fontSize: '3rem'
        fontWeight: 400
        lineHeight: 1.05
        letterSpacing: '-0.01em'
    headline-lg:
        fontFamily: 'Jua'
        fontSize: '2rem'
        fontWeight: 400
        lineHeight: 1.1
        letterSpacing: '-0.01em'
    headline-md:
        fontFamily: 'Jua'
        fontSize: '1.5rem'
        fontWeight: 400
        lineHeight: 1.15
        letterSpacing: '0em'
    body-lg:
        fontFamily: 'Pretendard'
        fontSize: '1.125rem'
        fontWeight: 500
        lineHeight: 1.6
        letterSpacing: '0em'
    body-md:
        fontFamily: 'Pretendard'
        fontSize: '1rem'
        fontWeight: 400
        lineHeight: 1.6
        letterSpacing: '0em'
    body-sm:
        fontFamily: 'Pretendard'
        fontSize: '0.875rem'
        fontWeight: 400
        lineHeight: 1.55
        letterSpacing: '0em'
    label-lg:
        fontFamily: 'Pretendard'
        fontSize: '1rem'
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: '0em'
    label-md:
        fontFamily: 'Pretendard'
        fontSize: '0.875rem'
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: '0.005em'
    label-sm:
        fontFamily: 'Pretendard'
        fontSize: '0.75rem'
        fontWeight: 600
        lineHeight: 1.2
        letterSpacing: '0.01em'

# --- SHAPE / RADIUS (organic, generous) ---
rounded:
    none: '0px'
    sm: '12px'
    md: '20px'
    lg: '28px'
    xl: '36px'
    full: '9999px'

# --- SPACING (4px base rhythm) ---
spacing:
    xs: '4px'
    sm: '8px'
    md: '12px'
    lg: '16px'
    xl: '24px'
    2xl: '32px'
    3xl: '48px'

# --- COMPONENT TOKENS ---
components:
    button-primary:
        backgroundColor: '{colors.primary}'
        textColor: '{colors.on-primary}'
        typography: '{typography.label-lg}'
        rounded: '{rounded.full}'
        padding: '16px'
    button-primary-hover:
        backgroundColor: '#B31A53'
        textColor: '{colors.on-primary}'
        rounded: '{rounded.full}'
    button-primary-active:
        backgroundColor: '#9E1648'
        textColor: '{colors.on-primary}'
        rounded: '{rounded.full}'
    choice-card:
        backgroundColor: '{colors.surface}'
        textColor: '{colors.on-surface}'
        typography: '{typography.body-lg}'
        rounded: '{rounded.lg}'
        padding: '20px'
    choice-card-hover:
        backgroundColor: '#FFFFFF'
        textColor: '{colors.on-surface}'
        rounded: '{rounded.lg}'
    progress-track:
        backgroundColor: '{colors.surface-sunken}'
        rounded: '{rounded.full}'
        height: '8px'
    badge-type:
        backgroundColor: '#2C5FB0'
        textColor: '{colors.on-group}'
        typography: '{typography.label-md}'
        rounded: '{rounded.full}'
        padding: '8px'
    result-card:
        backgroundColor: '{colors.surface}'
        textColor: '{colors.on-surface}'
        rounded: '{rounded.xl}'
        width: '1080px'
        height: '1080px'
---

# Overview

A **tropical daylight jungle**, rendered bright and tactile for a phone screen and
for the Instagram feed it will be shared into. The world sits on a **green base**
(not cream or ivory): a pale-leaf page with lighter leaf-white cards floating on
it. Depth comes not from darkness but from **layered foliage** — leaves that
overlap, cast soft green-tinted shadows, and part as you move through the test.

The personality is **playful, warm, and a little wild** — a cute parrot peeking
through the grass, not a corporate quiz. Vivid parrot-feather colors do the
shouting; the green world keeps it grounded so the feathers (and the user's own
parrot photo) stay the loudest thing on screen.

This is a **standalone viral microsite**, not the BuddyBird app. It defines its
own look, and anchors back to the app only through the brand color and logo on
the result card and CTAs. Single fixed theme (no automatic dark mode) — the
shared result card must look identical for every viewer.

> **Confirmed in the issue #03 human design review:** the visual direction and
> the **Test surface layout — variant C, "editorial trail"** (see below). The
> `primary` action color remains a **placeholder** until the BuddyBird brand color
> lands (issue #12); it is a single token and swaps in one place.

# Confirmed surface layout (issue #03 — variant C)

The Test 문항 화면 — the highest-density surface — was prototyped in three
executions and the **editorial trail** was chosen for its calm and legibility:

- **Backdrop.** The app-wide **PNG layered forest** (ADR-0004), a single fixed
  layer behind every surface (`<MobileForestBackground>`). A **cream legibility
  veil** washes the central content band so the forest is atmosphere, never
  competing with the text. (Superseded the former SVG leaf + gradient backdrop.)
- **Progress trail.** A horizontal band of step markers (`done`/`current`/upcoming)
  plus an `N / 12` count, across the top.
- **Photo card.** A surface card **above the question** holding the user's parrot
  photo (a corner leaf accent gives overlap depth). _Photo capture/upload is a
  separate issue; the layout reserves the slot._
- **Question card.** The question on a `surface` card with a small `문항 N / 12`
  kicker; large Jua header drives hierarchy by size.
- **Choices.** Full-width flat rows anchored to the bottom: a decorative feather
  accent bar (rotating group hue) + label on a safe rectangle + a chevron. The
  whole row is the hit target; selecting auto-advances.
- **Motion.** A gentle horizontal slide per question; instant cut under
  `prefers-reduced-motion`.

The tokens below are bound to the app as a Tailwind `@theme` system in
`app/globals.css`; primitives live on the Test surface (`app/test/`).

# Colors

The system has four color families. Keep them in their lanes.

- **Base world (greens).** `background`, `surface`, `surface-sunken`, `outline`,
  and the `foliage-*` layers. This is the stage. Text uses `on-surface` — a
  green-tinted forest ink, never pure black — for warmth.
- **Action anchor.** `primary` (hibiscus pink) is the **single CTA color** for the
  entire funnel — Start, Back, Share, Install App. It pops hardest on green and is
  deliberately outside the feather-hue family so "this color = go" is unambiguous.
- **Temperament-group feathers.** `group-ruby`, `group-marigold`, `group-teal`,
  `group-cobalt` carry **type identity only** — result headers, type badges, the
  result-card info band, progress flourishes. **Never** color an action button with
  a group hue (see Do's and Don'ts). These are **vivid mid-tones**: small white/dark
  text on the raw hue does **not** clear AA 4.5:1. When a group fill must carry small
  text (a badge, the result-card band), use a **deepened text-safe shade** of that
  hue (the `badge-type` token shows the deep-cobalt example, `#2C5FB0`). Reserve the
  raw hue for large text, icons, borders, and decorative fills. _(Final per-group
  deep shades are a human-design-review item.)_
- **Feedback.** `error` for validation/failed states.

`primary` (≥4.5:1 on white) and group hues are checked for contrast at the point
of use; body text always runs on `surface`/`background`, not on saturated fills.

# Typography

A deliberate two-family pairing (see ADR-0001 for why we replaced Geist):

- **Display — Jua** (rounded Korean gothic): `headline-display`, `headline-lg`,
  `headline-md`. Friendly and chunky; carries the "fun test" tone and the big
  result **type code**. Jua ships a single weight (400); we get emphasis from
  **size**, not weight.
- **Body — Pretendard**: `body-*` and `label-*`. Korean-web-grade legibility for
  questions, reports, and UI labels; weight contrast (400 → 700) carries hierarchy.

Hierarchy is driven by **scale contrast** — pair a large Jua headline against
small Pretendard body, don't crowd the scale. Korean is the only language (MVP);
Latin/numerals fall back within the same families.

> **Dependency:** Pretendard is self-hosted via `next/font/local` (not on Google
> Fonts). If the font files are unavailable, body falls back to **Noto Sans KR**.
> Jua loads via `next/font/google`.

# Layout

Mobile-first, single-column, **thumb-reachable**. One idea per viewport: the Test
shows exactly one question + two choices; primary CTAs sit at the **bottom center**
within thumb range.

Spacing follows a **4px rhythm** (`xs`→`3xl`). Use rhythm intentionally — tight
`sm`/`md` clusters inside a card, generous `2xl`/`3xl` between sections — rather
than uniform padding everywhere. Section gaps scale fluidly with the viewport.
Content max-width stays phone-sized even on desktop so the shared experience is
consistent.

# Elevation & Depth

Depth is **foliage layering**, not flat Material shadows:

1. **Overlap.** Leaf/foliage shapes overlap card edges so the world reads as
   stacked planes.
2. **Tinted shadow.** Shadows are **green-tinted** (derived from `foliage-deep`),
   soft and low, like a leaf shadow — never neutral gray.
3. **Surface lift.** `surface` cards sit above the `background`; `surface-sunken`
   recedes (progress track, wells).

Three levels are enough: sunken → base → raised card. Don't ladder ten shadows.

# Shapes

**Organic and rounded.** Generous corners (`rounded.lg`/`xl` on cards, `full` on
buttons and badges) set the friendly tone. The signature move is the
**organic leaf shape**: choice cards, badges, and dividers can be masked into
leaf/foliage silhouettes with `clip-path`.

**Guardrail (accessibility):** the leaf `clip-path` applies to the **visual layer
only**. Text, tap targets, and the focusable element stay on an inner **safe
rectangle** so labels never clip and focus rings stay legible. Keep clip paths
simple for compositor performance.

# Components

- **button-primary** — the one action affordance. Hibiscus fill, white label,
  `full` radius, large pill. Designed `hover`/`active`/`focus-visible` states
  (darken on press; visible focus ring offset from the pill).
- **choice-card** — a question's two options. Roomy `surface` card, `body-lg`
  label on an inner safe rectangle; optional leaf-mask on the visual layer.
  Whole card is the hit target; selecting auto-advances (no Next button).
- **progress-track** — slim `surface-sunken` rail showing question N of 12;
  may carry a foliage/trail flourish but the rail itself stays simple.
- **badge-type** — small pill carrying a **group feather color**, marking the
  result's temperament group.
- **result-card** — the 1080×1080 shared artifact: **photo hero on top** (the
  user's parrot in a leaf frame) + a **lower info band** (type code, type name,
  short copy, BuddyBird logo/CTA) in the group color. Text lives in the controlled
  band, never overlaid on the unpredictable user photo.

# Game UI layer (ADR-0006)

The foreground UI reads as a **cozy forest mobile game** (issues #19–#27): soft
raised buttons, papercut quest-card panels, and a restrained idle-motion layer
over the PNG forest. This extends the system above; the live token binding is
`app/globals.css` `@theme` (see the ADR-0005 note — this file's frontmatter
predates the 동화숲 pivot and values come from `globals.css`).

- **CTA stays bell orange** (`--color-primary` #E8772E — ADR-0001 reinforced).
  The lime family (`--color-accent` #AFF729 / `--color-accent-deep` #518D00)
  is **support only**: decor accents, progress flourishes, semantic fills.
  Never on an action button.
- **Surfaces.** Game panels use cream / mint / pale-leaf
  (`--color-surface-cream` #FFF8E3, `--color-surface-mint` #EAFBD8,
  `--color-surface-leaf` #DDF7B8) — no untreated pure-white cards. Content on
  green surfaces uses deep-green ink (`--color-ink-forest`) and soft green
  borders (`--color-border-leaf`).
- **Semantics.** reward #FFD966 · warning #FFB84D · soft error #FF7B72 ·
  info #54C7D8.
- **Shape.** Buttons/chips ride the pill; cards 24 px (`--radius-lg`); panels
  28 px (`--radius-panel`).
- **Elevation.** Forest-toned only (`--shadow-raised-button`,
  `--shadow-game-card`, `--shadow-floating`); raised buttons add a bottom
  depth bar in their own pressed shade. Hard black shadows stay banned.
- **Motion.** Motion for React via the `m` + LazyMotion convention; the shared
  vocabulary lives in `lib/motion/` (entrances 0.2–0.45 s on
  `--ease-leaf`/`--ease-spring`; decorative idle loops 3–7 s, mirrored,
  transform/opacity only). Durations: fast 160 ms · base 260 ms · slow 420 ms.
  Reduced motion: entrances degrade to opacity-only, taps and idle loops drop
  entirely.

# Do's and Don'ts

**Do**

- Keep `primary` as the only action color, everywhere in the funnel.
- Use group feather hues strictly for **type identity**.
- Build depth from overlapping foliage and green-tinted shadows.
- Drive hierarchy with Jua/Pretendard **size contrast**.
- Keep result-card text in the lower band for legibility over any photo.
- Honor `prefers-reduced-motion`: the foliage-parting transition becomes an
  instant cut/crossfade.

**Don't**

- Don't tint action buttons with a group color (breaks the learned affordance).
- Don't reintroduce automatic dark mode — single fixed theme only.
- Don't use cream/ivory as the base — the world is green.
- Don't put text on the leaf `clip-path` edge — keep it on the safe rectangle.
- Don't render Korean in Geist or an undefined system fallback.
- Don't animate layout-bound properties — transitions use
  `transform`/`opacity`/`clip-path` only.
