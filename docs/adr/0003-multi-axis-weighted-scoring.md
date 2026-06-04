---
status: accepted
---

# Multi-axis weighted scoring for behaviour-observation questions

The Parrot MBTI test scores a parrot's type from **13 two-choice questions** where
**each choice weights one or more axis letters by +1**, instead of the original
"12 questions, one choice = exactly one axis +1" model. The two choices of a
question are **symmetric**: they cover the same axes with the opposite letters, so a
question always contributes the same total to each axis it touches no matter which
side is picked.

## Context

The launch model (issue #02, ADR-era PRD) used 12 questions, 3 per axis, each choice
adding +1 to a single axis letter. Three questions per axis is odd, so a tie was
structurally impossible.

The product brief shifted to **guardian behaviour-observation** questions
(attachment / activity / communication themes). Real observed behaviours rarely map
cleanly onto a single MBTI axis — "creeps up and bites when over-touched" speaks to
both T/F and J/P at once. Forcing one axis per question either flattens the copy or
mis-scores the behaviour.

## Decision

- **13 questions, two choices each.** Each choice carries `weights:
Partial<Record<Letter, number>>` (currently every weight is `+1`).
- **Symmetric choices.** A question's two choices touch the _same_ axes with
  _opposite_ letters. Whichever side is chosen, every axis the question touches
  receives exactly +1 — so the per-axis answer count is fixed by the question set,
  not by the respondent.
- **Odd coverage per axis ⇒ no ties.** The axis-pair allocation gives each axis an
  **odd** number of touching questions (degree **EI 7 · SN 7 · TF 7 · JP 5**), which
  generalises the original "3 per axis ⇒ no tie" guarantee to the multi-axis case:
  if an axis is touched by K questions, `left + right == K`; K odd ⇒ `left != right`.
- **Axis-pair decomposition** (each question touches exactly 2 axes, 26 axis-touches
  total): `EI-SN×3, EI-TF×2, EI-JP×2, SN-TF×3, SN-JP×1, TF-JP×2` = 13 questions.
- **`computeResult` stays pure**: answers → per-axis left/right tally (summed over
  every chosen choice's weights) → majority letter per axis → `{ type, axisScores }`.
- **Deterministic per-axis tie-break as a safety net.** Although ties are
  structurally impossible with the design above, `computeResult` keeps a defensive
  per-axis default direction so a future content edit that breaks the odd-degree
  invariant degrades to a defined result rather than throwing on normal input. (It
  never fires for valid 13-answer input.)

## Considered Options

- **Keep one-axis-per-choice, add a 4th question per axis** — would reintroduce ties
  (even count) and still can't express behaviours that signal two axes at once.
- **Multi-axis with asymmetric weights** — lets a single choice lean an axis harder,
  but breaks the fixed per-axis total and reopens ties; far harder to reason about
  and verify. Rejected for the MVP.
- **Multi-axis, symmetric, odd coverage (chosen)** — expressive copy, provably
  tie-free, and verifiable by exhaustive enumeration of the 2¹³ answer space.

## Consequences

- The result URL must carry richer per-axis splits (an axis can now land anywhere
  from 7-0 to 4-3), so the codec moves from 1 bit/axis to a per-axis left-count
  (ADR follow-up implemented in `lib/result-url`). Bare codes stay backward
  compatible.
- Axis spectrum bars render by `left / (left + right)` ratio because axis totals now
  differ (7 or 5), not a fixed denominator.
- The 16-type distribution can skew if the weighted allocation is unbalanced
  (mitigated by exhaustive verification of the answer space at build-of-content time;
  symmetric design lets us rebalance by flipping a question's orientation without
  touching copy).
- `Question` is no longer bound to a single axis; `Choice` loses `axis`/`letter` in
  favour of `weights`. Downstream consumers that keyed off `question.axis` /
  `choice.letter` (analytics payload, Test progress bar tint) are updated accordingly.
