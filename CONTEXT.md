# 앵BTI

The shared language for the BuddyBird 앵BTI viral web — a mobile web that
derives a _parrot's_ MBTI from its guardian's answers and turns the result into a
shareable card that funnels toward installing the BuddyBird app.

## Flow surfaces

**Intro**:
The first screen — a fixed full-viewport hero: headline, the **Back Stack**
(the active **Trading Card** with the next two types peeking behind as ghost
card-backs; auto-advances, tap opens the **Detail Popup**, scrubbing opens the
**Deck Overlay**), the deck button ("16유형 모두 보기"), hero stats, and the
"테스트 시작하기" CTA. See ADR-0005 (auto-advance pattern) and ADR-0007.
_Avoid_: Landing, Home, Splash; "type showcase" / "peek carousel" (the surfaces
it replaced)

**Test**:
The screen that presents two-choice **Questions** one at a time — each framed as
a **Quest Sheet** — and auto-advances on selection.
_Avoid_: Quiz, Survey, Questions page

**Quest Sheet**:
The presentation unit for the current **Question** on the Test screen — a
parchment commission notice pinned to the forest, carrying the commission
number ("No.n"), the question's emoji stamp, and the question text. Chosen
over banner / keyword-highlight treatments in the 2026-06-07 prototype round.
_Avoid_: Question Card (the emoji-tile card it replaced), 문항 카드

**Result**:
The kraft-paper report screen showing the derived **Type** — gradient hero,
description / spectrum / match panels — plus the photo, share, deck ("도감
보기" opens the **Deck Overlay** in place), restart, and app-install actions.
_Avoid_: Outcome, Report page

**Trading Card**:
The collectible card unit of the deck system — an orange gradient frame around a
cream inner card with the type's gradient portrait window, code, and nickname.
Full size on the Intro Back Stack; compact (code/rule/name) in the Deck Overlay
grid.
_Avoid_: Type card, Showcase card

**Deck Overlay**:
The full-screen 16-type collection that opens over Intro and Result (scrub or
button on Intro, "도감 보기" on Result). Replaces the removed `/dex` route — see
ADR-0007. Tapping a card opens its **Detail Popup**.
_Avoid_: Dex, 도감 페이지 (it is an overlay, not a route), Collection page

**Detail Popup**:
The trading-card-style modal showing one Type in full — gradient portrait, code,
nickname, description, "찰떡궁합" match chips (which swap the popup's type), and
an optional CTA. Replaces the old Type Modal.
_Avoid_: Type Modal, Detail page

## MBTI model

**Question**:
A single prompt with exactly two **Choices**. Thirteen per test. A Question is
_not_ bound to a single **Axis** — each of its Choices may weight several Axes.
_Avoid_: Item, Q

**Choice**:
One of a Question's two options; weights the letters of one or more **Axes** by 1
each. The two Choices of a Question are **symmetric** — they cover the same Axes
with opposite letters, so the question contributes the same total to each Axis it
touches regardless of which side is picked. Its copy reads as a **Hook** followed
by a **Body**.
_Avoid_: Option, Answer (an "answer" is a Choice the user selected)

**Hook**:
The short punch line of a **Choice** — a quoted utterance, onomatopoeia, or
nickname — shown above the **Body** (the behavioural description) on the Test
screen's choice rows. Chosen in the 2026-06-07 Choice Row prototype round.
_Avoid_: Title, Headline (of a Choice)

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
