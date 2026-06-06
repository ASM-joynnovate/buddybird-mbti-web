// Flow: intro-carousel — the BackStack hero deck (design rebuild) keeps its
// active trading card and SR caption in sync: auto-advance moves the active
// type on its own, and tapping the active card opens that type's detail popup.
// (Filename kept from the old peek-carousel/showcase flows so the runner's flow
// list stays stable — the surface under test is now [data-testid="back-stack"].)
//
// Determinism notes:
// - Auto-advance (3s) is asserted by polling for ANY active-type change with a
//   hard attempt ceiling — no fixed sleeps, no exact-index dependency.
// - The tap assertion reads the active code and clicks IN ONE eval (separate
//   round-trips can straddle an auto-advance tick), then POLLS for the popup:
//   untrusted el.click() updates are not guaranteed a synchronous flush.

import { assert, clickTestId, evalJs, openUrl, waitFor, waitForSurface } from '../helpers.mjs'

const TYPE_RE = /^[EI][SN][TF][JP]$/

const ACTIVE_CODE_EXPR =
    '(function(){var el=document.querySelector(\'[data-testid="stack-active-card"]\');return el?el.getAttribute("data-code")||"":"";})()'

export async function run() {
    openUrl('/')
    await waitForSurface('intro-root')

    assert(
        evalJs('!!document.querySelector(\'[data-testid="back-stack"]\')') === true,
        'back-stack must be present',
    )

    // Active card announces a valid type code and the SR caption names the same
    // type. Code + caption are read in ONE eval: separate round-trips can
    // straddle an auto-advance tick and observe two different active types.
    const sync = evalJs(
        '(function(){' +
            'var c=document.querySelector(\'[data-testid="stack-active-card"]\');' +
            'var p=document.querySelector(\'[data-testid="stack-caption"]\');' +
            'return (c?c.getAttribute("data-code")||"":"")+"||"+(p?p.textContent.trim():"");' +
            '})()',
    )
    const [first, caption] = String(sync).split('||')
    assert(TYPE_RE.test(first), `active card code must be a 4-letter type; got "${first}"`)
    assert(
        typeof caption === 'string' && caption.startsWith(first),
        `caption must name the active type ${first}; got "${caption}"`,
    )

    // Ghost card-backs imply the deck behind the active card (decorative).
    assert(
        evalJs(
            '(function(){var f=document.querySelector(\'[data-testid="back-stack"]\');if(!f)return false;return f.querySelectorAll(\'[aria-hidden="true"].absolute\').length>=2;})()',
        ) === true,
        'two ghost card-backs must peek behind the active card',
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
        `back-stack auto-advance must move the active type (stuck on ${first})`,
    )

    // Tap: read the active code and click the card in the SAME eval, then poll
    // for its detail popup. The click handler's state update may flush
    // asynchronously, so the popup is awaited as a readiness signal.
    const tapped = evalJs(
        '(function(){' +
            'var b=document.querySelector(\'[data-testid="stack-active-card"]\');' +
            'if(!b)return "NO_CARD";' +
            'var code=b.getAttribute("data-code")||"";' +
            'b.click();' +
            'return code;' +
            '})()',
    )
    assert(
        typeof tapped === 'string' && TYPE_RE.test(tapped),
        `tapping needs a valid active card code (got ${tapped})`,
    )
    await waitFor(
        `!!document.querySelector('[data-testid="detail-popup-${tapped}"]')`,
        `detail popup for ${tapped} opens on card tap`,
    )

    // Close the popup and confirm it retires.
    clickTestId('detail-close')
    await waitFor(
        `!document.querySelector('[data-testid="detail-popup-${tapped}"]')`,
        'detail popup closes',
    )

    return { first, advanced, tapped }
}
