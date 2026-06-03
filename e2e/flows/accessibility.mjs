// Flow: accessibility — key semantics for screen-reader and keyboard users (issue
// #13): the carousel is a labelled group, the app CTA has an accessible name, every
// <img> carries alt text, the Test progress is a progressbar with live values, and
// choices are labelled native buttons.

import { assert, clickTestId, evalJs, openUrl, waitForSurface } from '../helpers.mjs'

export async function run() {
    openUrl('/')
    await waitForSurface('intro-root')

    assert(
        evalJs(
            '(function(){var c=document.querySelector(\'[data-testid="intro-carousel"]\');return !!c && c.getAttribute("role")==="group" && !!c.getAttribute("aria-label");})()',
        ) === true,
        'carousel must be a labelled group',
    )

    assert(
        evalJs(
            '(function(){var a=document.querySelector(\'[data-testid="app-cta-intro"]\');return !!a && a.textContent.trim().length>0;})()',
        ) === true,
        'intro app CTA must have an accessible name',
    )

    // Every rendered <img> must have non-empty alt (the parrot fallback uses role=img
    // + aria-label instead, so this only constrains real images).
    assert(
        evalJs(
            '(function(){var a=[].slice.call(document.images);return a.every(function(im){var alt=im.getAttribute("alt");return alt!==null && alt.length>0;});})()',
        ) === true,
        'all <img> elements must have non-empty alt text',
    )

    // The visible carousel slide must expose an accessible image name (img alt or the
    // fallback's role=img aria-label).
    assert(
        evalJs(
            '(function(){var f=document.querySelector(".carousel-frame");if(!f)return false;var img=f.querySelector("img");if(img)return !!img.getAttribute("alt");var fb=f.querySelector(\'[role="img"]\');return !!fb && !!fb.getAttribute("aria-label");})()',
        ) === true,
        'carousel slide must have an accessible image name',
    )

    // --- Test surface ---
    clickTestId('start-button')
    await waitForSurface('test-root')

    assert(
        evalJs(
            '(function(){var p=document.querySelector(\'[role="progressbar"]\');return !!p && p.getAttribute("aria-valuenow")!==null && p.getAttribute("aria-valuemax")!==null;})()',
        ) === true,
        'progress must be a progressbar with aria-valuenow/max',
    )

    assert(
        evalJs(
            '(function(){var c=document.querySelectorAll(\'[data-testid^="choice-"]\');if(!c.length)return false;for(var i=0;i<c.length;i++){if(c[i].tagName!=="BUTTON")return false;var l=c[i].getAttribute("aria-label");if(!l||!l.length)return false;}return true;})()',
        ) === true,
        'choices must be labelled native buttons',
    )

    return { ok: true }
}
