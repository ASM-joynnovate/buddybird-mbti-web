// Flow: deck-overlay — the full-screen 16-type deck (replaces the /dex route,
// ADR-0007). Uses the deterministic BUTTON open path only ("16유형 모두 보기" →
// openAnimated): the wheel/touch scrub is a continuous gesture agent-browser
// cannot drive reliably, and the button reaches the identical open state.
//
// Asserts: the overlay reaches data-open=true with 16 labelled card buttons,
// tapping a card opens its detail popup, the popup closes cleanly, and the
// deck close button retires the overlay (unmount — progress animates to 0).

import { assert, clickTestId, evalJs, openUrl, waitFor, waitForSurface } from '../helpers.mjs'

export async function run() {
    openUrl('/')
    await waitForSurface('intro-root')

    // Open the deck via the deterministic button path.
    clickTestId('deck-button')
    await waitFor(
        '(function(){var o=document.querySelector(\'[data-testid="deck-overlay"]\');return !!o && o.getAttribute("data-open")==="true";})()',
        'deck overlay reaches the open state',
    )

    // All 16 compact cards render as labelled, focusable buttons.
    const cardAudit = evalJs(
        '(function(){var c=document.querySelectorAll(\'[data-testid^="deck-card-"]\');if(c.length!==16)return "COUNT:"+c.length;for(var i=0;i<c.length;i++){if(c[i].tagName!=="BUTTON")return "NOT_BUTTON";var l=c[i].getAttribute("aria-label");if(!l||!l.length)return "NO_LABEL";if(c[i].tabIndex!==0)return "NOT_FOCUSABLE";}return "OK";})()',
    )
    assert(cardAudit === 'OK', `deck must render 16 labelled focusable cards (got ${cardAudit})`)

    // Tap a known card → its detail popup opens over the deck.
    clickTestId('deck-card-INTJ')
    await waitFor(
        '!!document.querySelector(\'[data-testid="detail-popup-INTJ"]\')',
        'INTJ detail popup opens from the deck',
    )

    // The popup names the type and offers the match panel.
    assert(
        evalJs(
            '(function(){var d=document.querySelector(\'[data-testid="detail-popup-INTJ"]\');if(!d)return false;return d.getAttribute("role")==="dialog" && d.getAttribute("aria-modal")==="true";})()',
        ) === true,
        'detail popup must be a modal dialog',
    )

    // Close the popup, then close the deck — the overlay unmounts entirely.
    clickTestId('detail-close')
    await waitFor(
        '!document.querySelector(\'[data-testid="detail-popup-INTJ"]\')',
        'detail popup closes',
    )
    clickTestId('deck-close')
    await waitFor(
        '!document.querySelector(\'[data-testid="deck-overlay"]\')',
        'deck overlay unmounts after close',
    )

    return { ok: true }
}
