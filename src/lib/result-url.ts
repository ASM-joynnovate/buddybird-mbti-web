import { AXES, AXIS_LETTERS, type Axis, type AxisScore, type TypeCode } from '@/types/mbti';

export const RESULT_PARAM = 't';

const TALLY_HEX_LEN = 6;

const SIDE_MAX = 7;

const RESULT_PATTERN = /^([EI][SN][TF][JP])([0-9a-f]*)$/;

export interface DecodedResult {
	type: TypeCode;
	axisScores: Record<Axis, AxisScore> | null;
}

export function fallbackScores(type: TypeCode): Record<Axis, AxisScore> {
	return AXES.reduce(
		(scores, axis, index) => {
			const leftWins = type[index] === AXIS_LETTERS[axis].left;
			scores[axis] = leftWins ? { left: 1, right: 0 } : { left: 0, right: 1 };
			return scores;
		},
		{} as Record<Axis, AxisScore>,
	);
}

const clampSide = (n: number): number => Math.min(SIDE_MAX, Math.max(0, Math.round(n)));

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

export function decodeResult(raw: string | null): DecodedResult | null {
	if (raw === null) {
		return null;
	}

	const match = RESULT_PATTERN.exec(raw);
	if (match === null) {
		return null;
	}

	const type = match[1];
	const suffix = match[2];

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
