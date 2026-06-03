# Implementation Report: 트로피컬 정글 UI 프로토타입 (이슈 #03)

## Summary

Built a **throwaway 3-variant prototype** of the Test 문항 화면 to put the DESIGN.md
"tropical jungle" direction in front of a human reviewer (issue #03's final
acceptance gate). Variants live on a dedicated dev-only `/prototype` route, consume
the **real** `useTestProgress()` + `@/content` `QUESTIONS`, and are toggled live via
a floating switcher (URL `?variant=A|B|C`, arrow keys).

## Tasks Completed

| # | Task | Status |
|---|---|---|
| 1 | `app/prototype/prototype-fonts.ts` (Jua + Noto Sans KR) | ✅ |
| 2 | `app/prototype/prototype.css` (scoped tokens + 3 variants) | ✅ |
| 3 | `app/prototype/prototype-variants.tsx` (A/B/C) | ✅ |
| 4 | `components/prototype-switcher.tsx` | ✅ |
| 5 | `app/prototype/prototype-view.tsx` + `page.tsx` (Suspense/notFound boundary) | ✅ |
| 6 | `app/prototype/NOTES.md` + full validation | ✅ |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| `yarn type-check` | ✅ Pass | 0 errors |
| `yarn lint` | ✅ Pass | 0 errors |
| `yarn build` (static export) | ✅ Pass | proves Suspense boundary + font weights compile |
| `yarn e2e` | ✅ Pass | 3/3 flows green; `/prototype` not visited, `/test` untouched |
| Production hidden | ✅ Pass | `out/prototype/index.html` is a 404 ("This page could not be found"); no `proto-root` leaked |
| Visual (375px) | ✅ Captured | `.scratch/parrot-mbti/proto-shots/variant-{A,B,C}.png` |
| Fonts | ✅ Verified | heading computes `Jua` (loaded); body `Noto Sans KR` (loaded) |

## Files Changed (all throwaway)

| File | Action |
|---|---|
| `app/prototype/page.tsx` | CREATED |
| `app/prototype/prototype-view.tsx` | CREATED |
| `app/prototype/prototype-variants.tsx` | CREATED |
| `app/prototype/prototype-fonts.ts` | CREATED |
| `app/prototype/prototype.css` | CREATED |
| `app/prototype/NOTES.md` | CREATED |
| `components/prototype-switcher.tsx` | CREATED |

Production happy path (`app/test/*`, `app/layout.tsx`, `app/globals.css`,
`content/*`, `lib/*`, existing `components/*`) **untouched**.

## Deviations / Findings

- **Static-export interaction confirmed (clarifies plan risk #1).** The repo is
  `output: 'export'`. `NODE_ENV` is `'production'` at build time, so the page's
  `notFound()` fires during the export and emits a 404 at `/prototype` — i.e. the
  prototype is **dev-only by construction**, with zero production surface. Verified
  by grepping the emitted `out/prototype/index.html`.
- **Variant B polish.** Initial capture had the bottom choice label colliding with
  the switcher pill; bumped bottom-panel padding to 104px and centered both panel
  labels for a cleaner two-panel composition.
- **reduced-motion** is implemented as a `@media (prefers-reduced-motion: reduce)`
  block neutralizing all variant animations/transitions; not visually re-verified
  through the agent-browser harness (no media emulation), but the rule is static.

## Review outcome → absorption + cleanup (completed)

**Verdict: variant C — "editorial trail"** was chosen in the human design review,
with two refinements requested live: (1) a richer jungle background (green
gradient + layered low-opacity foliage), and (2) a **photo card above the
question**, with the question moved into a `surface` card carrying a `문항 N/12`
kicker (the "가장 가까운 쪽을 골라 주세요" hint removed).

The winner was then absorbed into the real app and the prototype deleted:

| Change | File |
|---|---|
| Design system as Tailwind `@theme` tokens; body green base; auto dark-mode removed | `app/globals.css` |
| Geist → Jua (display) + Noto Sans KR (body) | `app/layout.tsx` |
| Test surface restyled to C | `app/test/page.tsx`, `app/test/test.css` (new) |
| Choice row primitive (feather bar + chevron) | `components/choice-button.tsx` |
| Progress trail primitive | `components/progress-indicator.tsx` |
| Light token retheme (testids preserved) | `app/page.tsx`, `app/result/result-view.tsx` |
| Decision recorded | `DESIGN.md` (v1.0 + confirmed-layout section), `docs/adr/0001` |
| Throwaway removed | deleted `app/prototype/`, `components/prototype-switcher.tsx` |

**Final validation (post-absorption, post-deletion):** `yarn type-check` ✅ 0
(stale `.next/types` ref to the deleted route cleared by the rebuild), `yarn lint`
✅ 0, `yarn build` ✅ static export, `yarn e2e` ✅ 3/3 (real `/test` driven —
testids and compute/route logic intact), no `/prototype` route in `out/`.

## Next Steps

- [ ] BuddyBird brand color swap for the `--color-primary` placeholder (issue #12).
- [ ] Real photo capture/upload into the reserved photo-card slot (photo issue).
- [ ] Apply the design system to remaining funnel surfaces (intro/result polish, app CTA).
