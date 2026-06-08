---
status: accepted
---

# Result polaroid hero, marker emphasis, and polaroid share card

The result screen and share card were rebuilt from a Claude Design handoff
(`랜딩 리디자인` + `공유 카드` bundles). Both designs stay inside the existing
동화숲 월드 system (ADR-0001) — this is a visual refinement, not a new direction.

## Decision

- **Adaptive polaroid hero.** The character moves out of the full-bleed
  `--type-grad` hero block into a tilted white **polaroid card** (washi tape +
  static ray burst + caption) sitting on the kraft-paper page. The card is
  adaptive: a single **character** photo by default, and a two-photo
  **내 앵무새 → 캐릭터** (before→after) layout once the user attaches a pet photo.
  The per-type gradient now fills the polaroid photo window; CODE + 이름 live in
  its caption. New unit: `features/result/result-polaroid/`.
- **형광펜 marker emphasis.** A `<mark>` highlighter treatment
  (`features/result/emphasize.tsx`) surfaces the `report` tagline as a "성격 분석"
  **lead** line and highlights quoted (`"…"`) phrases in `description`; section
  headers (성격 분석 / 성향 스펙트럼 / 환상의 궁합) and the axis dominant-% carry
  the same marker. Quote-less types degrade to plain text (graceful).
- **PhotoInput stays.** The handoff prototype dropped result-screen photo
  capture; we keep it (AGENTS.md product contract — the photo feeds both the
  hero polaroid and the share card). The hero polaroid is the only new consumer
  of `usePhotoSource().objectUrl`.
- **Polaroid share card.** The Canvas composition (`features/share/card/`) is
  rewritten from a photo-hero + info-band card to the **Design B polaroid**
  (1080²): paper → tilted card (tape + dashed brand stamp) → solo character or
  duo (내 앵무새 cover → 캐릭터 gradient+rays, each tagged) → caption
  (code/name/report). On-screen polaroid and shared card share the same tokens
  so the two artifacts read as one design.
- **Tailwind-only, Motion-owned (ADR-0008 upheld).** Every effect — ray burst
  (`conic-gradient` + radial mask), washi tape (`repeating-linear-gradient`),
  marker (`box-decoration-break: clone`), bob — is inline arbitrary Tailwind +
  child `<span>` + Motion. No `result.css`, no `@keyframes`. The Canvas card
  approximates the same effects with 2D primitives (wedge rays, stripe-pattern
  tape, dashed-arc stamp). Body copy keeps **Pretendard** (the prototype's Noto
  Sans KR is not adopted); the Canvas card keeps Jua + Noto Sans KR for the
  deterministic shared image.

## Considered Options

- **Polaroid hero + adaptive duo (chosen)** — keeps the viral photo mechanic,
  unifies on-screen and shared artifacts, and reads as a scrapbook the user made.
- **Drop PhotoInput, character-only polaroid (prototype-literal)** — simpler but
  removes documented photo capture and breaks the share-card composite source.
- **Reintroduce a scoped `result.css`** — the old per-feature CSS the v2 rebuild
  deleted (ADR-0008). Rejected: inline Tailwind + child spans express every
  effect, so the policy holds with no second styling language.

## Consequences

- `features/result/` gains `result-polaroid/` and `emphasize.tsx`; `result-view`
  and `axis-bars` consume the marker. `features/share/card/{card-layout,
compose-card}.ts` are rewritten and `share-button.tsx` now loads the character
  PNG and passes `colors` (the band-hex/logo inputs are gone).
- Analytics, deep-link, reduced-motion, and the 100%-client photo rule are
  unchanged. `data-testid="result-type"` moved to the polaroid caption (e2e
  selector preserved).
- ADR-0001's visual direction stands; this records its result-surface evolution.
