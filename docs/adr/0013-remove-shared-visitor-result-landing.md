---
status: accepted
---

# Collapse the result page to one layout (drop the shared-visitor variant)

The result page had two layouts keyed on `isSharedVisitor` (in-memory result vs a
bare `?t=` token): the **owner** (just finished the test) saw the photo + share +
panels; a **shared visitor** (arrived via a `?t=` link without taking the test)
saw a tailored variant — no photo input, a "나도 테스트하기" CTA, the panels. The two
paths drifted (e.g. a shared button mislabeled "친구한테 공유하기" that actually
restarted the test) and doubled the result-page code.

## Decision

- **One unified layout.** The result page renders the same page for everyone —
  PhotoInput + 친구에게 공유하기 + 버디버드 앱 CTA (above 성격 분석), the panels, and
  도감 보기 + 다시하기. No `isSharedVisitor` branch in the JSX.
- **Result source = in-memory OR `?t=`.** `type` resolves from the in-memory
  result (just took the test) **or**, when that is absent (refresh, or someone
  opening the result URL), by decoding `?t=` back into a type + axis tallies. So a
  refresh — and anyone with the link — restores and shows the result.
- **`?t=` stays as the durable record** of which result came out (set by
  `test-view.tsx` via `encodeResult`). It is the persistence mechanism for refresh
  and link-open; it is not a separate experience.
- **Redirect only when there is no result at all** — no in-memory result AND no /
  invalid `?t=` → `result_error` + `router.replace('/')` (nothing to show).
- `visitor` on `result_view` is kept as **analytics only** (`'owner'` when the
  in-memory result is present, else `'shared'`); it no longer changes the layout.

## Considered Options

- **Unify + restore from `?t=` (chosen)** — one code path; refresh and shared links
  both work because the param carries the full result; simplest persistence.
- **Keep the separate shared layout** — preserves the two-layout drift and the
  re-show-the-card redundancy with no real benefit.
- **sessionStorage for refresh, redirect link visitors to intro** — would keep
  links from showing the result, but adds a second persistence path and a
  same-device edge case; rejected since the product wants the param to restore the
  result for anyone with the URL.

## Consequences

- Refresh on `/result?t=…` restores the result (no longer bounces to the intro).
- Anyone opening a result URL sees the result in the unified layout — including the
  PhotoInput / share affordances; a link visitor can add their own photo and share,
  or 다시하기 to take the test. This is the intended viral surface.
- `decodeResult` / `RESULT_PARAM` / `useSearchParams` are read again in the result
  view; `fallbackScores` covers a legacy bare `?t=CODE`.
- `result_view` still fires `visitor: 'owner' | 'shared'`; `restart_click` now only
  fires `source: 'owner'` (the only restart button left). Event unions unchanged.
- Supersedes the two-layout shared-visitor behavior in earlier result-surface notes.
