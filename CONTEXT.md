# Parrot MBTI

The shared language for the BuddyBird Parrot MBTI viral web — a mobile web that
derives a _parrot's_ MBTI from its guardian's answers and turns the result into a
shareable card that funnels toward installing the BuddyBird app.

## Flow surfaces

**Intro**:
The first screen — service pitch, an **active type card** (a compact band: a 1:1
gradient image tile on the left, the type code · name · one-line report on the
right) paired with a **centre-fixed auto-advancing peek carousel** (all 16 types,
the middle tile highlighted, a tile tappable to activate it, seamless infinite
loop), and the "테스트 시작하기" CTA. The card and the centre tile share one active
index, so they always name the same type. See ADR-0005.
_Avoid_: Landing, Home, Splash; "peek-row" (the static row it replaced)

**Test**:
The screen that presents two-choice **Questions** one at a time and auto-advances
on selection.
_Avoid_: Quiz, Survey, Questions page

**Result**:
The screen showing the derived **Type**, its report, the parrot image, and the
photo/share/restart actions.
_Avoid_: Outcome, Report page

## MBTI model

**Question**:
A single prompt with exactly two **Choices**. Thirteen per test. A Question is
_not_ bound to a single **Axis** — each of its Choices may weight several Axes.
_Avoid_: Item, Q

**Choice**:
One of a Question's two options; weights the letters of one or more **Axes** by 1
each. The two Choices of a Question are **symmetric** — they cover the same Axes
with opposite letters, so the question contributes the same total to each Axis it
touches regardless of which side is picked.
_Avoid_: Option, Answer (an "answer" is a Choice the user selected)

**Axis**:
One of the four MBTI dimensions — E·I, S·N, T·F, J·P.
_Avoid_: Dimension, Scale

**Type**:
The four-letter code derived from the four Axes (e.g. `ENFP`); one of 16.
_Avoid_: Result code, Personality

**Temperament Group**:
One of **four** groupings of the 16 Types, following the 16personalities scheme
(Analysts `_NT_`, Diplomats `_NF_`, Sentinels `_S_J`, Explorers `_S_P`). Each
group owns one parrot-feather accent color and drives type identity in the UI and
on the **Result Card**.
_Avoid_: Category, Cluster, Quadrant

## Sharing & conversion

**Result Card**:
The 1080×1080 square image composited client-side for sharing — the user's parrot
photo + Type + copy + BuddyBird branding/CTA.
_Avoid_: Share image, OG image, Poster

**App CTA**:
The link that drives BuddyBird app installs (deep-link service + store links),
present on both Intro and Result.
_Avoid_: Install button, Download link
