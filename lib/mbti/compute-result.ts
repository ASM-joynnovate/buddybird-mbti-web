// Pure MBTI computation entry point. Stays content-independent: no imports from @/content.

import {
    AXES,
    AXIS_LETTERS,
    type Axis,
    type AxisScore,
    type Choice,
    type ComputeResult,
} from '@/lib/mbti/types'

// Thrown when input is missing, malformed, or fails to resolve every axis unambiguously.
// Callers should treat this as "the test is not validly complete" rather than a guessable result.
export class IncompleteAnswersError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'IncompleteAnswersError'
    }
}

// Narrow an unknown entry to a structurally valid Choice whose letter belongs to its axis.
function isValidChoice(entry: Choice | null | undefined): entry is Choice {
    if (entry == null) {
        return false
    }

    const pair = AXIS_LETTERS[entry.axis]
    if (pair === undefined) {
        return false
    }

    return entry.letter === pair.left || entry.letter === pair.right
}

// Aggregate answers into a 4-letter TypeCode plus per-axis tallies. Pure: no side effects.
// Throws IncompleteAnswersError on invalid input or any unresolved (empty/tied) axis.
export function computeResult(answers: Choice[]): ComputeResult {
    if (!Array.isArray(answers) || answers.length === 0) {
        throw new IncompleteAnswersError('answers must be a non-empty array')
    }

    answers.forEach((entry, index) => {
        if (!isValidChoice(entry)) {
            throw new IncompleteAnswersError(`answer at index ${index} is not a valid Choice`)
        }
    })

    const axisScores = AXES.reduce<Record<Axis, AxisScore>>(
        (scores, axis) => {
            const pair = AXIS_LETTERS[axis]
            const forAxis = answers.filter((answer) => answer.axis === axis)
            const left = forAxis.filter((answer) => answer.letter === pair.left).length
            const right = forAxis.length - left
            return { ...scores, [axis]: { left, right } }
        },
        {} as Record<Axis, AxisScore>,
    )

    // Defense-in-depth completeness check: every axis must receive the same
    // non-zero number of answers. Rejects partial input (e.g. one answer per axis)
    // that would otherwise resolve to a plausible but unearned result.
    const totals = AXES.map((axis) => axisScores[axis].left + axisScores[axis].right)
    const expected = totals[0]
    if (expected === 0 || totals.some((total) => total !== expected)) {
        throw new IncompleteAnswersError(
            'each axis must receive the same non-zero number of answers',
        )
    }

    const type = AXES.map((axis) => {
        const { left, right } = axisScores[axis]
        if (left + right === 0) {
            throw new IncompleteAnswersError(`axis ${axis} has no answers`)
        }
        if (left === right) {
            throw new IncompleteAnswersError(`axis ${axis} is tied (${left} vs ${right})`)
        }
        return left > right ? AXIS_LETTERS[axis].left : AXIS_LETTERS[axis].right
    }).join('')

    return { type, axisScores }
}
