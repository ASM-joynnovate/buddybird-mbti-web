// Flow: responsive — every surface stays free of horizontal overflow across the
// target breakpoints (issue #13). The static server runs in single-page mode (always
// serves the intro HTML), so each surface is reached by client navigation rather than
// a direct URL. Asserts documentElement.scrollWidth never exceeds the viewport.
import { assert, clickTestId, evalJs, openUrl, screenshot, setViewport, waitForSurface } from '../helpers.mjs';

const VIEWPORTS = [320, 375, 768, 1024, 1440];

const OVERFLOW_EXPR = '(function(){return document.documentElement.scrollWidth - window.innerWidth;})()';

const RESULT_VISIBLE_EXPR =
	'(function(){var d=document.querySelector(\'[data-testid="result-root"]\');' +
	"return !!(d && (d.offsetParent !== null || getComputedStyle(d).display !== 'none'));" +
	'})()';

function assertNoOverflow(width, label) {
	const overflow = Number(evalJs(OVERFLOW_EXPR));
	assert(overflow <= 2, `${label} at ${width}px overflows horizontally by ${overflow}px`);
}

export async function run() {
	let checks = 0;

	for (const width of VIEWPORTS) {
		setViewport(width, 900, 1);

		openUrl('/');
		await waitForSurface('intro-root');
		await new Promise((r) => setTimeout(r, 150));
		assertNoOverflow(width, 'intro');
		checks++;

		clickTestId('start-button');
		await waitForSurface('test-root');
		await new Promise((r) => setTimeout(r, 120));
		assertNoOverflow(width, 'test');
		checks++;

		screenshot(`/tmp/bb-responsive-${width}.png`);
	}

	// Result overflow via a full drive at the narrowest width (most likely to overflow).
	setViewport(320, 900, 1);
	openUrl('/');
	await waitForSurface('intro-root');
	clickTestId('start-button');
	await waitForSurface('test-root');

	let answered = 0;
	while (answered < 50) {
		if (evalJs(RESULT_VISIBLE_EXPR) === true) break;
		const clicked = evalJs(
			'(function(){var e=document.querySelector(\'[data-testid^="choice-"]\');if(!e)return null;e.click();return "OK";})()',
		);
		if (clicked === 'OK') answered++;
		await new Promise((r) => setTimeout(r, 160));
	}
	await waitForSurface('result-root');
	await new Promise((r) => setTimeout(r, 150));
	assertNoOverflow(320, 'result');
	checks++;

	// Restore the default mobile viewport for any subsequent flow.
	setViewport(390, 844, 2);

	return { checks };
}
