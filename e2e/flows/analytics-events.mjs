// Flow: analytics-events — verify the ordered analytics event sequence for a full run.
//
// Strategy:
//   1. Open /, wait for intro-root.
//   2. Install the capturing adapter via window.__setAnalyticsAdapter() BEFORE clicking start.
//   3. Drive the full 12-question flow picking all 'a' choices (yields ESTJ).
//   4. Read window.__analyticsEvents and assert the ordered sequence.
//
// Expected sequence (issue #11, multi-axis engine ADR-0003):
//   test_start x1
//   question_answered x13  (one per question, indices 0..12, with sane payload fields)
//   test_completed x1      (type === 'ESTJ')
//
// Deferred events that must NOT appear yet:
//   photo_attached, share_success, share_fallback, app_cta_click
import { assert, clickTestId, evalJs, findAndClickChoice, openUrl, waitForSurface } from '../helpers.mjs';

// Expected question count for the multi-axis engine (ADR-0003).
const EXPECTED_QUESTION_COUNT = 13;

// Expected result type when all 'a' choices are picked ('a' letters win each axis).
const EXPECTED_TYPE = 'ESTJ';

// Events that must NOT appear in this slice: the flow only starts the test,
// answers every question, and lands on the result — it never touches the deck,
// popups, back button, share, photos, or error paths. result_view IS expected
// (fires on result mount) and is deliberately absent from this list.
const DEFERRED_EVENTS = [
	'photo_attached',
	'share_success',
	'share_fallback',
	'app_cta_click',
	'deck_open',
	'deck_close',
	'detail_open',
	'detail_close',
	'detail_cta_click',
	'test_back',
	'restart_click',
	'share_cancel',
	'share_error',
	'photo_removed',
	'result_error',
];

// Safety ceiling for the drive loop.
const MAX_QUESTIONS = 50;

// Return true when result-root is present and visible.
const RESULT_VISIBLE_EXPR =
	`(function(){` +
	`var d=document.querySelector('[data-testid="result-root"]');` +
	`return !!(d && (d.offsetParent !== null || getComputedStyle(d).display !== 'none'));` +
	`})()`;

export async function run() {
	// --- Open intro, wait for page to be fully ready ---
	openUrl('/');
	await waitForSurface('intro-root');

	// --- Install capturing adapter BEFORE any interaction ---
	// window.__setAnalyticsAdapter is wired by installAnalyticsTestHook() on mount.
	// The hook is a no-op until explicitly invoked here.
	const hookInstalled = evalJs(
		`(function(){if(typeof window.__setAnalyticsAdapter !== 'function')return false;window.__setAnalyticsAdapter();return true;})()`,
	);
	assert(
		hookInstalled === true || hookInstalled === 'true',
		'window.__setAnalyticsAdapter must be a function and must install without error',
	);

	// Confirm the event buffer is empty before the flow starts.
	const initialCount = evalJs(`(window.__analyticsEvents && window.__analyticsEvents.length) || 0`);
	assert(Number(initialCount) === 0, `event buffer must be empty before test starts; got ${initialCount}`);

	// --- Drive the full flow, picking 'a' on every question ---
	clickTestId('start-button');
	await waitForSurface('test-root');

	let questionIndex = 0;
	for (;;) {
		if (questionIndex >= MAX_QUESTIONS) {
			throw new Error(`analytics-events: answered ${MAX_QUESTIONS} questions without reaching result-root`);
		}

		// Atomically find-and-click the 'a' choice in one eval round-trip.
		let clicked = false;
		let resultVisible = false;
		let attempts = 0;

		while (attempts < 150) {
			resultVisible = evalJs(RESULT_VISIBLE_EXPR) === true;
			if (resultVisible) break;

			const clickedId = findAndClickChoice('a');
			if (clickedId) {
				clicked = true;
				break;
			}

			await new Promise((r) => setTimeout(r, 200));
			attempts++;
		}

		if (resultVisible) break;

		if (!clicked) {
			throw new Error(
				`analytics-events: no 'a' choice appeared after question ${questionIndex} ` +
					`and result-root never became visible`,
			);
		}

		questionIndex++;
	}

	assert(
		questionIndex === EXPECTED_QUESTION_COUNT,
		`expected to answer exactly ${EXPECTED_QUESTION_COUNT} questions; answered ${questionIndex}`,
	);

	await waitForSurface('result-root');

	// --- Read captured events ---
	// Serialise the whole array as JSON so we get a single atomic snapshot.
	const eventsJson = evalJs(`JSON.stringify(window.__analyticsEvents || [])`);

	let events;
	try {
		events = JSON.parse(eventsJson);
	} catch {
		throw new Error(`Failed to parse window.__analyticsEvents JSON: ${eventsJson}`);
	}

	assert(Array.isArray(events), 'window.__analyticsEvents must be an array');

	// Drop diagnostic image_error events (only fire when an asset is missing in
	// the environment) so they can never break the ordered-sequence assertions.
	events = events.filter((e) => e.name !== 'image_error');

	// --- Assert ordered sequence ---

	// 1. First event: test_start
	assert(events.length >= 1, 'expected at least 1 event (test_start)');
	assert(events[0].name === 'test_start', `event[0] must be test_start; got ${events[0].name}`);

	// 2. Exactly one test_start total
	const testStartEvents = events.filter((e) => e.name === 'test_start');
	assert(testStartEvents.length === 1, `expected exactly 1 test_start; got ${testStartEvents.length}`);

	// 3. Exactly 12 question_answered events (one per question, indices 0..11)
	const qaEvents = events.filter((e) => e.name === 'question_answered');
	assert(
		qaEvents.length === EXPECTED_QUESTION_COUNT,
		`expected ${EXPECTED_QUESTION_COUNT} question_answered events; got ${qaEvents.length}`,
	);

	// Verify each question_answered has required payload fields and sequential indices.
	for (let i = 0; i < qaEvents.length; i++) {
		const p = qaEvents[i].payload;
		assert(
			typeof p.questionId === 'string' && p.questionId.length > 0,
			`question_answered[${i}].payload.questionId must be a non-empty string; got ${JSON.stringify(p.questionId)}`,
		);
		assert(
			typeof p.choiceId === 'string' && p.choiceId.length > 0,
			`question_answered[${i}].payload.choiceId must be a non-empty string; got ${JSON.stringify(p.choiceId)}`,
		);
		assert(p.index === i, `question_answered[${i}].payload.index must be ${i}; got ${JSON.stringify(p.index)}`);
	}

	// 4. Ordering: test_start before first question_answered
	const firstQaIdx = events.findIndex((e) => e.name === 'question_answered');
	const lastStartIdx = events.map((e) => e.name).lastIndexOf('test_start');
	assert(lastStartIdx < firstQaIdx, 'test_start must appear before the first question_answered in the event stream');

	// 5. test_completed: exactly one, after all question_answered, type === ESTJ
	const tcEvents = events.filter((e) => e.name === 'test_completed');
	assert(tcEvents.length === 1, `expected exactly 1 test_completed; got ${tcEvents.length}`);
	assert(
		tcEvents[0].payload.type === EXPECTED_TYPE,
		`test_completed.payload.type must be '${EXPECTED_TYPE}'; got '${tcEvents[0].payload.type}'`,
	);

	const lastQaIdx = events.map((e) => e.name).lastIndexOf('question_answered');
	const tcIdx = events.findIndex((e) => e.name === 'test_completed');
	assert(lastQaIdx < tcIdx, 'test_completed must appear after the last question_answered in the event stream');

	// 6. No deferred events must be present.
	for (const deferredName of DEFERRED_EVENTS) {
		const found = events.some((e) => e.name === deferredName);
		assert(!found, `deferred event "${deferredName}" must not appear in this slice`);
	}

	return {
		eventCount: events.length,
		sequence: events.map((e) => e.name),
		completedType: tcEvents[0].payload.type,
	};
}
