// Result type <-> URL query param mapping for the static `/result` route.
// The result code travels as a query param so the route stays statically exported,
// and opening `/result/?t=ENFP` directly reconstructs the same type (issue #07).
//
// The token optionally carries the full per-axis tally so a shared visitor sees the
// exact same axis spectrum bars as the player. With multi-axis weighted scoring
// (ADR-0003) an axis can land anywhere from 7-0 to 4-3, so a single bit no longer
// captures it. Each axis packs its `left` (3 bits) and `right` (3 bits) counts into
// 6 bits; the four axes (EI, SN, TF, JP order) fill 24 bits and serialize as six
// base-16 chars appended to the code, e.g. `ENFP3814...`. A bare `ENFP` (no suffix)
// stays valid, and a legacy 1-char strength suffix degrades gracefully to the bare
// code (pre-launch links, no bar data).
import { AXES, type Axis, type AxisScore, type TypeCode } from '@/lib/mbti/types';

// Query param key carrying the result token on `/result`.
export const RESULT_PARAM = 't';

// Number of hex chars in the packed per-axis tally suffix (4 axes × 6 bits = 24 bits).
const TALLY_HEX_LEN = 6;

// 3-bit ceiling for a single axis side count (max axis degree is 7; ADR-0003).
const SIDE_MAX = 7;

// Decoded token: the type plus, when present, the exact per-axis tallies in AXES order.
// `axisScores` is null for legacy/manual bare-code links.
export interface DecodedResult {
	type: TypeCode;
	axisScores: Record<Axis, AxisScore> | null;
}

const clampSide = (n: number): number => Math.min(SIDE_MAX, Math.max(0, Math.round(n)));

// Encode a result into its URL representation. With axisScores, append the packed
// per-axis tally; without, emit the bare code (backward compatible).
export function encodeResult(type: TypeCode, axisScores?: Record<Axis, AxisScore>): string {
	if (axisScores === undefined) {
		return type;
	}

	let value = 0;
	AXES.forEach((axis, index) => {
		const { left, right } = axisScores[axis];
		const chunk = (clampSide(left) << 3) | clampSide(right);
		value += chunk * Math.pow(2, index * 6);
	});

	return `${type}${value.toString(16).padStart(TALLY_HEX_LEN, '0')}`;
}

// Decode a raw query value into a DecodedResult, or null when the code is invalid.
export function decodeResult(raw: string | null): DecodedResult | null {
	if (raw === null) {
		return null;
	}

	const match = /^([EI][SN][TF][JP])([0-9a-f]*)$/.exec(raw);
	if (match === null) {
		return null;
	}

	const type = match[1];
	const suffix = match[2];

	// Bare code, or a legacy/unknown-length suffix we no longer parse: type only.
	if (suffix.length !== TALLY_HEX_LEN) {
		return { type, axisScores: null };
	}

	const value = parseInt(suffix, 16);
	const axisScores = AXES.reduce<Record<Axis, AxisScore>>(
		(scores, axis, index) => {
			const chunk = Math.floor(value / Math.pow(2, index * 6)) & 0b111111;
			scores[axis] = { left: (chunk >> 3) & 0b111, right: chunk & 0b111 };
			return scores;
		},
		{} as Record<Axis, AxisScore>,
	);

	return { type, axisScores };
}
