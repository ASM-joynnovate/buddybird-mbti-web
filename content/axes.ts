// Presentation metadata for the four MBTI axes shown as result spectrum bars.
// Labels are the playful BuddyBird names; the letter is the canonical MBTI letter
// shown in parentheses (e.g. "인싸새(E)"). `cssVar` is the per-axis bar color token
// defined in globals.css. Orientation (left/right) matches AXIS_LETTERS in lib/mbti.

import type { Axis, Letter } from '@/lib/mbti'

export interface AxisEnd {
    label: string
    letter: string
    // Per-letter identity hue (동화숲 월드). Used by the Test quiz to tint each option
    // badge / selected accent and to color the answered segment in the progress bar.
    color: string
}

export interface AxisMeta {
    left: AxisEnd
    right: AxisEnd
    cssVar: string
}

export const AXIS_META: Record<Axis, AxisMeta> = {
    EI: {
        left: { label: '인싸새', letter: 'E', color: '#e8772e' },
        right: { label: '집콕새', letter: 'I', color: '#3e8fd0' },
        cssVar: 'var(--color-axis-ei)',
    },
    SN: {
        left: { label: '현실새', letter: 'S', color: '#5b9e3a' },
        right: { label: '구름새', letter: 'N', color: '#7b3fb5' },
        cssVar: 'var(--color-axis-sn)',
    },
    TF: {
        left: { label: '팩폭새', letter: 'T', color: '#2e9bb5' },
        right: { label: '말랑새', letter: 'F', color: '#e86a9e' },
        cssVar: 'var(--color-axis-tf)',
    },
    JP: {
        left: { label: '칼각새', letter: 'J', color: '#3c7a24' },
        right: { label: '즉흥새', letter: 'P', color: '#e8b53a' },
        cssVar: 'var(--color-axis-jp)',
    },
}

// Flat letter → identity hue lookup, derived from AXIS_META ends. Lets the quiz color
// an option (or an answered progress segment) straight from a choice's `letter`.
export const LETTER_COLOR: Record<Letter, string> = Object.values(AXIS_META).reduce(
    (acc, meta) => {
        acc[meta.left.letter as Letter] = meta.left.color
        acc[meta.right.letter as Letter] = meta.right.color
        return acc
    },
    {} as Record<Letter, string>,
)
