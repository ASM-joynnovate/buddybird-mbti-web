// Result type <-> URL query param mapping for the static `/result` route.
// The result code travels as a query param so the route stays statically exported.
// TODO(#07): finalize answer/type encoding & restoration.

import type { TypeCode } from '@/lib/mbti/types'

// Query param key carrying the result type code on `/result`.
export const RESULT_PARAM = 't'

// Encode a result type into its URL representation. Bare code for now.
export function encodeResult(type: TypeCode): string {
    return type
}

// Decode a raw query value back into a valid TypeCode, or null when invalid.
export function decodeResult(raw: string | null): TypeCode | null {
    if (raw !== null && /^[EI][SN][TF][JP]$/.test(raw)) {
        return raw
    }

    return null
}
