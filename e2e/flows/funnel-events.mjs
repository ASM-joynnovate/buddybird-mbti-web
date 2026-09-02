// Flow: funnel-events — the previously-deferred funnel events now fire at the right
// points (issue #11): photo_attached (gallery upload, #08), share_success (Web Share
// stubbed to capture the file, #09), and app_cta_click (result placement, #06/#07).
//
// Strategy: install the capturing adapter, drive the full test to a real result,
// upload a photo, stub navigator.share to accept files, click share, then click the
// result app CTA (default-prevented so the anchor does not navigate).
import { assert, clickTestId, evalJs, openUrl, waitForSurface } from '../helpers.mjs';

const MAX_QUESTIONS = 50;

const RESULT_VISIBLE_EXPR =
	'(function(){' +
	'var d=document.querySelector(\'[data-testid="result-root"]\');' +
	"return !!(d && (d.offsetParent !== null || getComputedStyle(d).display !== 'none'));" +
	'})()';

const UPLOAD_EXPR =
	'(async function(){' +
	'var c=document.createElement("canvas");c.width=80;c.height=80;' +
	'var x=c.getContext("2d");x.fillStyle="#3d7bd9";x.fillRect(0,0,80,80);' +
	'var b=await new Promise(function(r){c.toBlob(r,"image/png");});' +
	'var f=new File([b],"p.png",{type:"image/png"});' +
	'var inp=document.querySelector(\'[data-testid="photo-gallery-input"]\');' +
	'var dt=new DataTransfer();dt.items.add(f);inp.files=dt.files;' +
	'inp.dispatchEvent(new Event("change",{bubbles:true}));return true;})()';

const STUB_SHARE_EXPR =
	'(function(){window.__shared=null;' +
	'navigator.canShare=function(){return true;};' +
	'navigator.share=function(d){window.__shared=(d.files&&d.files[0])||null;return Promise.resolve();};' +
	'return true;})()';

const CLICK_CTA_EXPR =
	'(function(){var a=document.querySelector(\'[data-testid="app-cta-result"]\');' +
	'if(!a)return false;a.addEventListener("click",function(e){e.preventDefault();},{once:true});' +
	'a.click();return true;})()';

export async function run() {
	openUrl('/');
	await waitForSurface('intro-root');

	// Install capturing adapter before any interaction.
	const installed = evalJs(
		"(function(){if(typeof window.__setAnalyticsAdapter!=='function')return false;window.__setAnalyticsAdapter();return true;})()",
	);
	assert(installed === true || installed === 'true', 'analytics test hook must install');

	// Drive the full test to an own result.
	clickTestId('start-button');
	await waitForSurface('test-root');

	let answered = 0;
	while (answered < MAX_QUESTIONS) {
		if (evalJs(RESULT_VISIBLE_EXPR) === true) break;
		const clicked = evalJs(
			'(function(){var e=document.querySelector(\'[data-testid^="choice-"]\');if(!e)return null;e.click();return "OK";})()',
		);
		if (clicked === 'OK') answered++;
		await new Promise((r) => setTimeout(r, 180));
	}
	await waitForSurface('result-root');

	// Photo upload (gallery path) -> photo_attached.
	evalJs(UPLOAD_EXPR);
	await new Promise((r) => setTimeout(r, 350));
	assert(
		!!evalJs('!!document.querySelector(\'[data-testid="photo-preview"]\')'),
		'photo preview must appear after upload',
	);

	// Share (stubbed) -> share_success.
	evalJs(STUB_SHARE_EXPR);
	clickTestId('share-button');
	await new Promise((r) => setTimeout(r, 1000));
	assert(!!evalJs('!!window.__shared'), 'share must hand a File to navigator.share');

	// Result app CTA -> app_cta_click (navigation prevented).
	assert(evalJs(CLICK_CTA_EXPR) === true, 'result app CTA must be clickable');
	await new Promise((r) => setTimeout(r, 200));

	// Deck from the result surface -> deck_open { source: 'result' }.
	clickTestId('deck-open-button');
	await new Promise((r) => setTimeout(r, 600));

	// Read and assert the captured events.
	const json = evalJs('JSON.stringify(window.__analyticsEvents || [])');
	let events;
	try {
		events = JSON.parse(json);
	} catch {
		throw new Error(`Failed to parse window.__analyticsEvents JSON: ${json}`);
	}
	const names = events.map((e) => e.name);

	const photo = events.find((e) => e.name === 'photo_attached');
	assert(photo !== undefined, 'photo_attached must fire');
	assert(photo.payload.source === 'gallery', `photo_attached.source must be gallery; got ${photo.payload.source}`);

	const share = events.find((e) => e.name === 'share_success');
	assert(share !== undefined, 'share_success must fire');
	assert(
		/^[EI][SN][TF][JP]$/.test(share.payload.type),
		`share_success.type must be a type; got ${share.payload.type}`,
	);

	const cta = events.find((e) => e.name === 'app_cta_click');
	assert(cta !== undefined, 'app_cta_click must fire');
	assert(cta.payload.placement === 'result', `app_cta_click.placement must be result; got ${cta.payload.placement}`);

	// result_view: exactly once (the ref guard regression check), owner visit.
	const views = events.filter((e) => e.name === 'result_view');
	assert(views.length === 1, `expected exactly 1 result_view; got ${views.length}`);
	assert(views[0].payload.visitor === 'owner', `result_view.visitor must be owner; got ${views[0].payload.visitor}`);
	assert(
		/^[EI][SN][TF][JP]$/.test(views[0].payload.type),
		`result_view.type must be a type; got ${views[0].payload.type}`,
	);

	// deck_open from the result surface.
	const deckOpen = events.find((e) => e.name === 'deck_open');
	assert(deckOpen !== undefined, 'deck_open must fire');
	assert(
		deckOpen.payload.source === 'result' && deckOpen.payload.trigger === 'button',
		`deck_open payload must be {source:result, trigger:button}; got ${JSON.stringify(deckOpen.payload)}`,
	);

	return { events: names };
}
