---
status: accepted
---

# Visual design direction: tropical jungle, single fixed theme

The 앵BTI web adopts a **tropical daylight-jungle** visual direction on a
**green base** (not cream/ivory), with parrot-feather accents and an organic-leaf
shape language. We chose it because the product's required signature motion —
"part the foliage and move forward" between questions — becomes _native_ to the
world rather than bolted on, and because vivid feather colors on a green stage
make the shared result card pop in the Instagram feed. The full token system
lives in `DESIGN.md`.

## Considered Options

- **Tropical jungle foliage (chosen)** — motion language is intrinsic; strong,
  on-theme character; feathers carry type identity.
- **Soft pastel cute** — shareable but risks looking like a generic Korean
  "cute test" template (anti-template policy).
- **Neo-brutalism / bold pop** — distinctive and screenshots well, but clashes
  with the warm, cute parrot tone.
- **Glassmorphism** — mobile-performance and legibility cost, off-theme.

## Consequences

- **Single fixed theme.** The Next.js template's automatic
  `prefers-color-scheme` dark mode is removed — a shared result card must look
  identical for every viewer.
- **Typography replaced.** Geist (Latin-only) cannot render Korean; the system
  moves to **Jua (display) + Pretendard (body)**. Pretendard is self-hosted via
  `next/font/local`, with **Noto Sans KR** as fallback.
- **16→4 grouping introduced.** Feathers are systematized into **4 temperament
  groups** (16personalities' NT/NF/SJ/SP), a new domain concept ("기질 그룹",
  see `CONTEXT.md`) that content (#12) and the compute layer must reflect.
- **Brand anchor is a placeholder.** The single action color is a placeholder
  token until the BuddyBird brand color is confirmed (#12); it swaps in one place.
- This direction is the **gate for UI slices 04·05·06·07·08·09·13**; reversing it
  after those are built is expensive — hence this record.

## Issue #03 review outcome (surface execution)

The Test 문항 화면 was prototyped in three radically different executions
(immersive foliage tunnel / leaf-cut duel / **editorial trail**) on a throwaway
`/prototype` route and reviewed by a human. **Variant C — "editorial trail" —
was chosen** for calm and legibility: green-gradient backdrop with low-opacity
layered foliage, a top progress trail, a **photo card above the question**, the
question on a surface card with a `문항 N/12` kicker, and bottom-anchored
full-width choice rows (feather accent + chevron, auto-advance). The winning
execution was absorbed into the real `@theme` tokens (`app/globals.css`) +
primitives (`app/test/`); the prototype was deleted. Full spec in `DESIGN.md`.
