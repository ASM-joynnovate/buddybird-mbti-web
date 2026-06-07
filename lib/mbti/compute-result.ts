// Pure MBTI computation entry point. Stays content-independent: no imports from @/content.

import {
    AXES,
    AXIS_LETTERS,
    type Axis,
    type AxisScore,
    type Choice,
    type ComputeResult,
    type Letter,
} from '@/lib/mbti/types'

// Thrown when input is missing, malformed, or fails to resolve every axis unambiguously.
// Callers should treat this as "the test is not validly complete" rather than a guessable
// result. Internal-only for now — re-export it if a caller ever needs instanceof checks.
class IncompleteAnswersError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'IncompleteAnswersError'
    }
}

// Reverse map: letter -> the axis it belongs to. Used to validate choice weights.
const LETTER_AXIS = AXES.reduce<Record<Letter, Axis>>(
    (acc, axis) => {
        acc[AXIS_LETTERS[axis].left] = axis
        acc[AXIS_LETTERS[axis].right] = axis
        return acc
    },
    {} as Record<Letter, Axis>,
)

// Defensive tie-break: the winning side for an axis that somehow lands tied. Ties are
// structurally impossible for the shipped content (odd coverage per axis, ADR-0003),
// so this never fires on valid 13-answer input — it only keeps the function total if a
// future content edit breaks the odd-degree invariant.
const DEFAULT_DIRECTION: Record<Axis, 'left' | 'right'> = {
    EI: 'left',
    SN: 'left',
    TF: 'left',
    JP: 'left',
}

// Narrow an unknown entry to a structurally valid Choice: present, with a non-empty
// `weights` map whose every key is a known axis letter.
function isValidChoice(entry: Choice | null | undefined): entry is Choice {
    if (entry == null || typeof entry !== 'object') {
        return false
    }

    const weights = entry.weights
    if (weights == null || typeof weights !== 'object') {
        return false
    }

    const letters = Object.keys(weights) as Letter[]
    if (letters.length === 0) {
        return false
    }

    return letters.every((letter) => LETTER_AXIS[letter] !== undefined)
}

// Aggregate answers into a 4-letter TypeCode plus per-axis tallies. Pure: no side effects.
// Sums every chosen choice's weights per axis, then takes the majority letter per axis.
// Throws IncompleteAnswersError on invalid input or any axis that received no weight.
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
            const { left: leftLetter, right: rightLetter } = AXIS_LETTERS[axis]
            let left = 0
            let right = 0
            for (const answer of answers) {
                left += answer.weights[leftLetter] ?? 0
                right += answer.weights[rightLetter] ?? 0
            }
            return { ...scores, [axis]: { left, right } }
        },
        {} as Record<Axis, AxisScore>,
    )

    // Completeness check: every axis must receive at least one weight. An empty axis
    // means the run is incomplete (missing answers surface here, since the caller maps
    // the full question list and unanswered slots arrive as invalid entries above).
    for (const axis of AXES) {
        const { left, right } = axisScores[axis]
        if (left + right === 0) {
            throw new IncompleteAnswersError(`axis ${axis} received no answers`)
        }
    }

    const type = AXES.map((axis) => {
        const { left, right } = axisScores[axis]
        const pair = AXIS_LETTERS[axis]
        if (left === right) {
            return DEFAULT_DIRECTION[axis] === 'left' ? pair.left : pair.right
        }
        return left > right ? pair.left : pair.right
    }).join('')

    return { type, axisScores }
}
