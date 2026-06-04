// Barrel for the content data module.

import { AXES, AXIS_LETTERS, type Axis, type Letter } from '@/lib/mbti/types'
import { QUESTIONS } from './questions'

// Reverse map: letter -> { axis, side }. Lets us read which axis a weight touches.
const LETTER_AXIS = AXES.reduce<Record<Letter, { axis: Axis; side: 'left' | 'right' }>>(
    (acc, axis) => {
        acc[AXIS_LETTERS[axis].left] = { axis, side: 'left' }
        acc[AXIS_LETTERS[axis].right] = { axis, side: 'right' }
        return acc
    },
    {} as Record<Letter, { axis: Axis; side: 'left' | 'right' }>,
)

// Collapse a choice's weights into an axis -> side map, validating every key.
// Throws when a letter is unknown or two weights collide on the same axis.
function axisSides(questionId: string, choiceId: string, weights: Partial<Record<Letter, number>>) {
    const sides: Partial<Record<Axis, 'left' | 'right'>> = {}
    const entries = Object.entries(weights) as [Letter, number | undefined][]
    if (entries.length === 0) {
        throw new Error(`Content invariant violated: ${questionId}/${choiceId} has no weights`)
    }
    for (const [letter, value] of entries) {
        const meta = LETTER_AXIS[letter]
        if (meta === undefined) {
            throw new Error(
                `Content invariant violated: ${questionId}/${choiceId} weights unknown letter "${letter}"`,
            )
        }
        if (value === undefined || value <= 0) {
            throw new Error(
                `Content invariant violated: ${questionId}/${choiceId} letter "${letter}" weight must be positive`,
            )
        }
        if (sides[meta.axis] !== undefined) {
            throw new Error(
                `Content invariant violated: ${questionId}/${choiceId} weights both letters of axis ${meta.axis}`,
            )
        }
        sides[meta.axis] = meta.side
    }
    return sides
}

// Content invariant (ADR-0003): the two choices of a question must be SYMMETRIC —
// they touch the same axes with OPPOSITE letters. A mismatch would skew the engine or
// reopen ties, so fail fast at module load.
for (const question of QUESTIONS) {
    const [a, b] = question.choices
    const sidesA = axisSides(question.id, a.id, a.weights)
    const sidesB = axisSides(question.id, b.id, b.weights)

    const axesA = Object.keys(sidesA).sort().join(',')
    const axesB = Object.keys(sidesB).sort().join(',')
    if (axesA !== axesB) {
        throw new Error(
            `Content invariant violated: ${question.id} choices touch different axes (${axesA} vs ${axesB})`,
        )
    }
    for (const axis of Object.keys(sidesA) as Axis[]) {
        if (sidesA[axis] === sidesB[axis]) {
            throw new Error(
                `Content invariant violated: ${question.id} choices are not opposite on axis ${axis}`,
            )
        }
    }
}

export * from './questions'
export * from './types'
export * from './assets'
export * from './axes'
export * from './gradient'
