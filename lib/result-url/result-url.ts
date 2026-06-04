// Result type <-> URL query param mapping for the static `/result` route.
// The result code travels as a query param so the route stays statically exported,
// and opening `/result/?t=ENFP` directly reconstructs the same type (issue #07).
//
// The token optionally carries per-axis strengths so a shared visitor sees the same
// axis spectrum bars as the player. Each axis has 3 questions and no ties, so the
// winning side is always 3-0 or 2-1 — one bit per axis (1 = 3-0 sweep). The four
// bits (EI, SN, TF, JP order) pack into 0–15 and serialize as one base-16 char
// appended to the code, e.g. `ENFPe`. A bare `ENFP` (no strength char) stays valid.

import { AXES, type Axis, type AxisScore, type TypeCode } from '@/lib/mbti/types'

// Query param key carrying the result token on `/result`.
export const RESULT_PARAM = 't'

// Decoded token: the type plus, when present, the per-axis "is this a 3-0 sweep" bits
// in AXES order. `strengths` is null for legacy/manual bare-code links.
export interface DecodedResult {
    type: TypeCode
    strengths: boolean[] | null
}

const STRENGTH_CHAR = /^[0-9a-f]$/

// Encode a result into its URL representation. With axisScores, append the packed
// strength char; without, emit the bare code (backward compatible).
export function encodeResult(type: TypeCode, axisScores?: Record<Axis, AxisScore>): string {
    if (axisScores === undefined) {
        return type
    }

    let bits = 0
    AXES.forEach((axis, index) => {
        const { left, right } = axisScores[axis]
        const isSweep = Math.max(left, right) >= 3
        if (isSweep) {
            bits |= 1 << index
        }
    })

    return `${type}${bits.toString(16)}`
}

// Decode a raw query value into a DecodedResult, or null when the code is invalid.
export function decodeResult(raw: string | null): DecodedResult | null {
    if (raw === null) {
        return null
    }

    const match = /^([EI][SN][TF][JP])([0-9a-f])?$/.exec(raw)
    if (match === null) {
        return null
    }

    const type = match[1]
    const strengthChar = match[2]

    if (strengthChar === undefined || !STRENGTH_CHAR.test(strengthChar)) {
        return { type, strengths: null }
    }

    const bits = parseInt(strengthChar, 16)
    const strengths = AXES.map((_, index) => (bits & (1 << index)) !== 0)

    return { type, strengths }
}
