// Barrel for the content data module.

import { QUESTIONS } from './questions'

// Content invariant: every choice must score the same axis as its question.
// A mismatch would silently skew the engine, so fail fast at module load.
for (const question of QUESTIONS) {
    for (const choice of question.choices) {
        if (choice.axis !== question.axis) {
            throw new Error(
                `Content invariant violated: ${question.id}/${choice.id} axis ${choice.axis} !== ${question.axis}`,
            )
        }
    }
}

export * from './questions'
export * from './types'
export * from './assets'
