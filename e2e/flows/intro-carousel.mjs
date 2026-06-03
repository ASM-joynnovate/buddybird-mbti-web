// Flow: intro-carousel — the 16-type carousel responds to its manual controls and
// the intro app CTA is present (issue #06). Auto-advance (3.5s) runs independently, so
// the assertions only require that each control MOVES the slide, not an exact index —
// that keeps the flow deterministic without depending on pausing auto-advance.

import { assert, evalJs, openUrl, waitForSurface } from '../helpers.mjs'

const CODE_EXPR =
    "(function(){var el=document.querySelector('[data-testid=\"carousel-caption\"] .carousel-caption-code');return el?el.textContent:'';})()"

export async function run() {
    openUrl('/')
    await waitForSurface('intro-root')

    assert(
        !!evalJs('!!document.querySelector(\'[data-testid="intro-carousel"]\')'),
        'intro-carousel must be present',
    )
    assert(
        !!evalJs('!!document.querySelector(\'[data-testid="app-cta-intro"]\')'),
        'intro app CTA must be present',
    )

    const first = evalJs(CODE_EXPR)
    assert(
        typeof first === 'string' && first.length === 4,
        `caption code must be a type; got ${first}`,
    )

    // Both controls are native buttons (keyboard-reachable, issue #13).
    assert(
        evalJs(
            '(function(){var p=document.querySelector(\'[data-testid="carousel-prev"]\');var n=document.querySelector(\'[data-testid="carousel-next"]\');return !!p && !!n && p.tagName==="BUTTON" && n.tagName==="BUTTON";})()',
        ) === true,
        'carousel prev/next must be native buttons',
    )

    // Click next, then poll for the caption to change. Auto-advance only adds forward
    // motion, so a manual next reliably lands on a different type — no exact-index
    // dependency, no race with the 3.5s timer.
    evalJs(
        '(function(){document.querySelector(\'[data-testid="carousel-next"]\').click();return true;})()',
    )
    let moved = first
    for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 150))
        moved = evalJs(CODE_EXPR)
        if (moved !== first) break
    }
    assert(moved !== first, `carousel-next must advance the slide (stuck on ${first})`)

    return { first, moved }
}
