// Flow: known-answer-type — drive two deterministic choice sequences and assert
// strict equality of the computed MBTI type (real engine, issue #02+).
//
// Invariant from content/questions.ts (multi-axis symmetric scoring, ADR-0003):
//   'a' letters win a majority on every axis -> all-'a' yields ESTJ
//   'b' letters win a majority on every axis -> all-'b' yields INFP
//
// Each combo atomically finds-and-clicks the choice ending in the target variant
// in one eval round-trip, avoiding the find-then-click race condition.
import { assert, clickTestId, evalJs, findAndClickChoice, getText, openUrl, waitForSurface } from '../helpers.mjs';

// Safety ceiling — must exceed the largest possible question count.
const MAX_QUESTIONS = 50;

// Return true when result-root is present and visible.
const RESULT_VISIBLE_EXPR =
	`(function(){` +
	`var d=document.querySelector('[data-testid="result-root"]');` +
	`return !!(d && (d.offsetParent !== null || getComputedStyle(d).display !== 'none'));` +
	`})()`;

// Drive a complete run picking `variant` ('a' or 'b') on every question.
// Returns the text content of [data-testid="result-type"].
async function driveVariant(variant) {
	openUrl('/');
	await waitForSurface('intro-root');

	clickTestId('start-button');
	await waitForSurface('test-root');

	let questionIndex = 0;
	for (;;) {
		if (questionIndex >= MAX_QUESTIONS) {
			throw new Error(
				`known-answer-type (${variant}): answered ${MAX_QUESTIONS} questions without ` +
					`reaching result-root — possible infinite loop`,
			);
		}

		let clicked = false;
		let resultVisible = false;
		let attempts = 0;

		while (attempts < 150) {
			resultVisible = evalJs(RESULT_VISIBLE_EXPR) === true;
			if (resultVisible) break;

			// Atomically find-and-click the choice ending in `variant` in one eval.
			const clickedId = findAndClickChoice(variant);
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
				`known-answer-type (${variant}): no '${variant}' choice appeared after question ` +
					`${questionIndex} and result-root never became visible`,
			);
		}

		questionIndex++;
	}

	await waitForSurface('result-root');

	const typeText = getText('result-type');
	assert(typeText !== null, `result-type must be present (variant=${variant})`);
	return typeText;
}

export async function run() {
	// Combo 1: all 'a' choices -> ESTJ
	const typeA = await driveVariant('a');
	assert(typeA === 'ESTJ', `all-'a' combo: expected result-type 'ESTJ', got '${typeA}'`);

	// Combo 2: all 'b' choices -> INFP
	const typeB = await driveVariant('b');
	assert(typeB === 'INFP', `all-'b' combo: expected result-type 'INFP', got '${typeB}'`);

	return { allA: typeA, allB: typeB };
}
