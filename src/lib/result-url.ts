import { AXES, AXIS_LETTERS, type Axis, type AxisScore, type TypeCode } from '@/types/mbti';

export const RESULT_PARAM = 't';

// 축마다 (left, right)를 한쪽 5비트씩 담는다. 예전 링크는 한쪽 3비트·6자리였고 계속 읽는다.
const TALLY = { sideBits: 5, hexLen: 10 };
const LEGACY_TALLY = { sideBits: 3, hexLen: 6 };

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

export function encodeResult(type: TypeCode, axisScores?: Record<Axis, AxisScore>): string {
	if (axisScores === undefined) {
		return type;
	}

	const { sideBits, hexLen } = TALLY;
	const sideMax = 2 ** sideBits - 1;
	const clampSide = (n: number): number => Math.min(sideMax, Math.max(0, Math.round(n)));

	let value = 0;
	AXES.forEach((axis, index) => {
		const { left, right } = axisScores[axis];
		const chunk = clampSide(left) * 2 ** sideBits + clampSide(right);
		value += chunk * 2 ** (index * sideBits * 2);
	});

	return `${type}${value.toString(16).padStart(hexLen, '0')}`;
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

	const format = [TALLY, LEGACY_TALLY].find(({ hexLen }) => hexLen === suffix.length);
	if (format === undefined) {
		return { type, axisScores: null };
	}

	const { sideBits } = format;
	const sideSize = 2 ** sideBits;
	const value = parseInt(suffix, 16);
	const axisScores = AXES.reduce<Record<Axis, AxisScore>>(
		(scores, axis, index) => {
			const chunk = Math.floor(value / 2 ** (index * sideBits * 2)) % (sideSize * sideSize);
			scores[axis] = { left: Math.floor(chunk / sideSize), right: chunk % sideSize };
			return scores;
		},
		{} as Record<Axis, AxisScore>,
	);

	return { type, axisScores };
}
