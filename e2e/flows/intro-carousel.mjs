// Flow: intro-carousel — the intro TypeShowcase (issues #14–#16 redesign) keeps its
// active card, peek track, and caption in sync: auto-advance moves the active type
// on its own, and tapping a peek tile activates that tile's type immediately.
// (Filename kept from the old peek-carousel flow so the runner's flow list stays
// stable — the surface under test is now [data-testid="intro-showcase"], issue #18.)
//
// Determinism notes:
// - Auto-advance (3s) is asserted by polling for ANY active-type change with a hard
//   attempt ceiling — no fixed sleeps, no exact-index dependency.
// - The tap assertion focuses the target tile first (focus pauses auto-advance via
//   the showcase's onFocusCapture), clicks it, then POLLS for the activation:
//   untrusted el.click() updates are not guaranteed a synchronous discrete flush,
//   so the active card is awaited as a readiness signal, never read same-tick.

import { assert, evalJs, openUrl, waitForSurface } from '../helpers.mjs'

const TYPE_RE = /^[EI][SN][TF][JP]$/

const ACTIVE_CODE_EXPR =
    '(function(){var el=document.querySelector(\'[data-testid="showcase-active-card"] .showcase-card-code\');return el?el.textContent.trim():"";})()'

export async function run() {
    openUrl('/')
    await waitForSurface('intro-root')

    assert(
        evalJs('!!document.querySelector(\'[data-testid="intro-showcase"]\')') === true,
        'intro-showcase must be present',
    )

    // Active card announces a valid type code and the caption names the same type.
    // Code + caption are read in ONE eval: separate round-trips can straddle an
    // auto-advance tick and observe two different active types.
    const sync = evalJs(
        '(function(){' +
            'var c=document.querySelector(\'[data-testid="showcase-active-card"] .showcase-card-code\');' +
            'var p=document.querySelector(\'[data-testid="showcase-caption"]\');' +
            'return (c?c.textContent.trim():"")+"||"+(p?p.textContent.trim():"");' +
            '})()',
    )
    const [first, caption] = String(sync).split('||')
    assert(TYPE_RE.test(first), `active card code must be a 4-letter type; got "${first}"`)
    assert(
        typeof caption === 'string' && caption.startsWith(first),
        `caption must name the active type ${first}; got "${caption}"`,
    )

    // Peek tiles are native buttons and exactly one is the pressed (active) tile.
    assert(
        evalJs(
            '(function(){var t=document.querySelectorAll(".showcase-peek-track .peek");if(!t.length)return false;var pressed=0;for(var i=0;i<t.length;i++){if(t[i].tagName!=="BUTTON")return false;if(t[i].getAttribute("aria-pressed")==="true")pressed++;}return pressed===1;})()',
        ) === true,
        'peek tiles must be native buttons with exactly one pressed tile',
    )

    // Auto-advance: poll until the active type changes (3s interval; ceiling ~7.5s).
    let advanced = first
    for (let i = 0; i < 25; i++) {
        await new Promise((r) => setTimeout(r, 300))
        advanced = evalJs(ACTIVE_CODE_EXPR)
        if (advanced !== first) break
    }
    assert(
        advanced !== first,
        `showcase auto-advance must move the active type (stuck on ${first})`,
    )

    // Tap: focus a non-active tile (focus pauses auto-advance via the showcase's
    // onFocusCapture, removing the timer from the race entirely), click it in the
    // same eval, then poll for the active card to follow. The click handler's state
    // update may flush asynchronously (untrusted events are not discrete-priority),
    // so the activation is awaited as a readiness signal — never asserted same-tick.
    const expected = evalJs(
        '(function(){' +
            'var tiles=document.querySelectorAll(".showcase-peek-track .peek");' +
            'var active=-1;' +
            'for(var i=0;i<tiles.length;i++){if(tiles[i].classList.contains("is-active")){active=i;break;}}' +
            'if(active<0)return "NO_ACTIVE";' +
            'var target=tiles[active+2]||tiles[active-2];' +
            'if(!target)return "NO_TARGET";' +
            'target.focus();' +
            'target.click();' +
            'return (target.getAttribute("aria-label")||"").slice(0,4);' +
            '})()',
    )
    assert(
        typeof expected === 'string' && TYPE_RE.test(expected),
        `tap target tile must exist next to the active tile (got ${expected})`,
    )
    let observed = ''
    for (let i = 0; i < 20; i++) {
        observed = evalJs(ACTIVE_CODE_EXPR)
        if (observed === expected) break
        await new Promise((r) => setTimeout(r, 150))
    }
    assert(
        observed === expected,
        `tapping a peek tile must activate its type (expected ${expected}, got ${observed})`,
    )

    return { first, advanced, tapped: expected }
}
