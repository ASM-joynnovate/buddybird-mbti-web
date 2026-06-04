---
status: accepted
---

# Intro active type card + centre-fixed infinite peek carousel

The Intro replaces its static type **peek row** (a width-fitted row of a few
non-interactive parrot tiles) with a **type showcase**: an **active type card**
above a **centre-fixed, auto-advancing, tappable peek carousel** of all 16 types.
Both are owned by one client component (`components/type-showcase.tsx`) that holds
a **single active-type index**, so the card and the highlighted middle tile always
name the same type.

This extends the ADR-0001 intro visual direction (the "동화숲" world): the goal of
the Intro is to show off the breadth and charm of the 16 parrot types and pull the
visitor into starting the test, so the surface now spotlights one type in detail
while continuously parading the rest.

## Decision

- **Active type card.** A compact card directly under the headline, split into
  ~5:9 columns: a **padded 1:1 gradient tile** holding the active parrot on the
  left (a square inside its padding, never filling the card), and the
  `type code | name` line plus a two-line clamped report on the right. Its height
  follows content rather than a fixed aspect ratio (see Consequences).
- **Centre-fixed peek carousel.** All 16 types ride a horizontal track that is
  anchored at the viewport centre and **auto-advances one tile every 3 s** on a
  compositor-friendly `transform` only. The middle (active) tile is emphasised
  with a `scale` that does not affect the layout pitch; the left/right neighbours
  are dimmed and peek in.
- **Seamless infinite loop.** The pool is tripled into a single track and a
  **silent reset** (transition suppressed for one frame) snaps the position back
  into the middle copy at an identical cell when a slide settles in an outer copy,
  so the last → first wrap shows no rewind or jump.
- **Tap to activate.** Each tile is a `<button>`; tapping it sets the shared index,
  recentres the slide on that type, and updates the active card.
- **Single source of truth.** One index drives both the card and the centre tile;
  tapping, auto-advance, and the loop reset all funnel through it.

## Considered Options

- **Active card + centre-fixed infinite carousel (chosen)** — spotlights one type
  in depth while continuously showing all 16; the shared index keeps the card and
  carousel honest; the infinite loop reads as an endless, lively parade that
  reinforces "there are lots of these — find yours in the app".
- **A single-slide carousel** (one parrot at a time, prev/next) — already used on
  other surfaces; shows only one type with no peek of the others, so it conveys
  breadth poorly for a funnel whose pitch is the 16-type variety.
- **Keep the static peek row** — cheapest, but it is inert, fits only a few tiles
  on narrow phones, and has no notion of an "active" type to pair with a detail
  card.

## Consequences

- **Card shape changed from the prototype's 3:2.** The prototype fixed the card at
  a 3:2 outer ratio; in review that ran too tall on phones, so the fixed ratio was
  dropped and the card height now follows its content (the taller of the 1:1 tile
  and the right-hand text), with the tile capped to a compact square. The 5:9
  column split and the left-tile / right-text composition are unchanged.
- **Relationship to ADR-0001 and ADR-0004.** This is a continuation of the
  ADR-0001 intro visual line, not a reversal: the single fixed "동화숲" theme and
  cream surfaces are kept, and the showcase sits over the ADR-0004 PNG forest
  background. Only the Intro's mid-section (former peek row) changes.
- **Accessibility.** Auto-advance pauses on hover and on keyboard focus and is fully
  disabled under `prefers-reduced-motion` (no auto-advance, no slide/scale/fade
  tweens — a static first type). Tiles are real buttons carrying `aria-pressed` and
  a type-name `aria-label`; a visually-hidden `aria-live="polite"` caption announces
  the active type for assistive tech.
- **Motion is transform/opacity only.** The slide, the active-tile emphasis, and the
  card swap animate compositor-friendly properties only, keeping the CLS/INP budget.
- **One bubbling pitfall to respect.** The peek tiles tween `opacity`/`transform`
  on (de)emphasis and those `transitionend` events bubble to the track; the loop's
  reset handler must therefore guard on `event.target === event.currentTarget &&
event.propertyName === 'transform'` or it fires several times per slide and
  overshoots the index out of range, dropping the centred cell. (Encoded in the
  component; noted here so a future refactor does not reintroduce it.)
- **Reversibility.** The mechanism is isolated to `type-showcase.tsx` + its CSS and
  one mount point in `app/page.tsx`; reverting to a static row is a localised change.
