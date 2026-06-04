// Flow: full navigation — Intro -> Test (answer all questions) -> Result -> Restart -> Intro.
// Answers ALL questions by looping: at each step atomically find-and-click the first
// visible choice button ([data-testid^="choice-"]) in one eval round-trip, then wait
// for either new choices to appear or result-root to become visible.
// Does not hardcode the question count. Asserts each surface transition via sentinel.

import {
    assert,
    clickTestId,
    evalJs,
    findAndClickFirstChoice,
    getText,
    openUrl,
    waitForSurface,
} from '../helpers.mjs'

// Maximum questions we will answer before giving up — a safety ceiling, not a timing
// assumption. The real engine has 13 (ADR-0003); this leaves headroom for growth.
const MAX_QUESTIONS = 50

// Return true when result-root is present and visible.
const RESULT_VISIBLE_EXPR =
    `(function(){` +
    `var d=document.querySelector('[data-testid="result-root"]');` +
    `return !!(d && (d.offsetParent !== null || getComputedStyle(d).display !== 'none'));` +
    `})()`

export async function run() {
    // --- Intro ---
    openUrl('/')
    await waitForSurface('intro-root')

    assert(
        !!evalJs(`!!document.querySelector('[data-testid="start-button"]')`),
        'start-button must be present on intro',
    )

    // --- Navigate to Test ---
    clickTestId('start-button')
    await waitForSurface('test-root')

    // --- Answer all questions by polling ---
    // Each iteration atomically finds-and-clicks the first available choice in one
    // eval call. This avoids the two-round-trip race where the element disappears
    // between the find eval and the click eval.
    let questionIndex = 0
    for (;;) {
        if (questionIndex >= MAX_QUESTIONS) {
            throw new Error(
                `full-navigation: answered ${MAX_QUESTIONS} questions without reaching result-root — ` +
                    `possible infinite loop`,
            )
        }

        // Poll until we either click a choice or see result-root.
        let clicked = false
        let resultVisible = false
        let attempts = 0

        while (attempts < 150) {
            resultVisible = evalJs(RESULT_VISIBLE_EXPR) === true
            if (resultVisible) break

            // Confirm progress indicator is present before clicking.
            assert(
                !!evalJs(`!!document.querySelector('[data-testid="progress"]')`),
                `progress indicator must be visible on question ${questionIndex + 1}`,
            )

            const clickedId = findAndClickFirstChoice()
            if (clickedId) {
                clicked = true
                break
            }

            await new Promise((r) => setTimeout(r, 200))
            attempts++
        }

        if (resultVisible) break

        if (!clicked) {
            throw new Error(
                `full-navigation: no choice button appeared after question ${questionIndex} ` +
                    `and result-root never became visible`,
            )
        }

        questionIndex++
    }

    assert(questionIndex > 0, 'expected to answer at least one question before result-root')

    // --- Result ---
    await waitForSurface('result-root')

    const typeText = getText('result-type')
    assert(typeText !== null, 'result-type element must be present and non-empty')
    assert(
        /^[EI][SN][TF][JP]$/.test(typeText),
        `result-type "${typeText}" must be a 4-letter MBTI code`,
    )

    assert(
        !!evalJs(`!!document.querySelector('[data-testid="restart-button"]')`),
        'restart-button must be present on result',
    )

    // --- Restart -> Intro ---
    clickTestId('restart-button')
    await waitForSurface('intro-root')

    assert(
        !!evalJs(`!!document.querySelector('[data-testid="start-button"]')`),
        'start-button must be present after restart',
    )

    return { questionsAnswered: questionIndex, type: typeText }
}
