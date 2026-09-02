// Flow: accessibility — key semantics for screen-reader and keyboard users, updated
// for the BackStack intro (design rebuild): the active trading card is a labelled
// native button, the SR caption is a polite live region, intro action buttons have
// accessible names, image alt discipline holds across the page (decorative images
// may use alt="" only inside an aria-hidden subtree), the Test progress is a
// progressbar with live values, and choices are labelled native buttons.
import { assert, clickTestId, evalJs, openUrl, waitForSurface } from '../helpers.mjs';

export async function run() {
	openUrl('/');
	await waitForSurface('intro-root');

	// Back stack: the active card is a labelled native button carrying its code.
	assert(
		evalJs(
			'(function(){var b=document.querySelector(\'[data-testid="stack-active-card"]\');if(!b||b.tagName!=="BUTTON")return false;var l=b.getAttribute("aria-label");return !!l && l.length>0 && !!b.getAttribute("data-code");})()',
		) === true,
		'back-stack active card must be a labelled native button with a data-code',
	);

	// The SR caption announcing the active type is a polite live region.
	assert(
		evalJs(
			'(function(){var c=document.querySelector(\'[data-testid="stack-caption"]\');return !!c && c.getAttribute("aria-live")==="polite";})()',
		) === true,
		'back-stack caption must be an aria-live=polite region',
	);

	// Intro action buttons (start + deck) must expose accessible names.
	assert(
		evalJs(
			'(function(){var ids=["start-button","deck-button"];for(var i=0;i<ids.length;i++){var b=document.querySelector(\'[data-testid="\'+ids[i]+\'"]\');if(!b)return false;var name=(b.getAttribute("aria-label")||b.textContent||"").trim();if(!name.length)return false;}return true;})()',
		) === true,
		'intro start/deck buttons must have accessible names',
	);

	// Image alt discipline: every <img> carries an alt attribute; an EMPTY alt is
	// allowed only for decorative images inside an aria-hidden subtree (the PNG
	// forest background); all other images need a non-empty alt.
	assert(
		evalJs(
			'(function(){var a=[].slice.call(document.images);return a.every(function(im){var alt=im.getAttribute("alt");if(alt===null)return false;if(alt.length>0)return true;return !!im.closest(\'[aria-hidden="true"]\');});})()',
		) === true,
		'every <img> must have alt text (empty alt only inside aria-hidden decoration)',
	);

	// The active stack card must expose an accessible image name (img alt or the
	// parrot fallback's role=img + aria-label).
	assert(
		evalJs(
			'(function(){var f=document.querySelector(\'[data-testid="stack-active-card"]\');if(!f)return false;var img=f.querySelector("img");if(img)return !!img.getAttribute("alt");var fb=f.querySelector(\'[role="img"]\');return !!fb && !!fb.getAttribute("aria-label");})()',
		) === true,
		'back-stack active card must have an accessible image name',
	);

	// --- Test surface ---
	clickTestId('start-button');
	await waitForSurface('test-root');

	assert(
		evalJs(
			'(function(){var p=document.querySelector(\'[role="progressbar"]\');return !!p && p.getAttribute("aria-valuenow")!==null && p.getAttribute("aria-valuemax")!==null;})()',
		) === true,
		'progress must be a progressbar with aria-valuenow/max',
	);

	assert(
		evalJs(
			'(function(){var c=document.querySelectorAll(\'[data-testid^="choice-"]\');if(!c.length)return false;for(var i=0;i<c.length;i++){if(c[i].tagName!=="BUTTON")return false;var l=c[i].getAttribute("aria-label");if(!l||!l.length)return false;}return true;})()',
		) === true,
		'choices must be labelled native buttons',
	);

	return { ok: true };
}
