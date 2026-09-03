import {
	AXES,
	AXIS_LETTERS,
	type Axis,
	type AxisScore,
	type Choice,
	type ComputeResult,
	type Letter,
} from '@/types/mbti';

class IncompleteAnswersError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'IncompleteAnswersError';
	}
}

const LETTERS = new Set(Object.values(AXIS_LETTERS).flatMap(({ left, right }) => [left, right]));

const DEFAULT_DIRECTION: Record<Axis, 'left' | 'right'> = {
	EI: 'left',
	SN: 'left',
	TF: 'left',
	JP: 'left',
};

function isValidChoice(entry: Choice | null | undefined): entry is Choice {
	if (entry == null || typeof entry !== 'object') {
		return false;
	}

	const weights = entry.weights;
	if (weights == null || typeof weights !== 'object') {
		return false;
	}

	const letters = Object.keys(weights) as Letter[];
	if (letters.length === 0) {
		return false;
	}

	return letters.every((letter) => LETTERS.has(letter));
}

export function computeResult(answers: Choice[]): ComputeResult {
	if (!Array.isArray(answers) || answers.length === 0) {
		throw new IncompleteAnswersError('answers must be a non-empty array');
	}

	answers.forEach((entry, index) => {
		if (!isValidChoice(entry)) {
			throw new IncompleteAnswersError(`answer at index ${index} is not a valid Choice`);
		}
	});

	const axisScores = AXES.reduce<Record<Axis, AxisScore>>(
		(scores, axis) => {
			const { left: leftLetter, right: rightLetter } = AXIS_LETTERS[axis];
			let left = 0;
			let right = 0;
			for (const answer of answers) {
				left += answer.weights[leftLetter] ?? 0;
				right += answer.weights[rightLetter] ?? 0;
			}
			return { ...scores, [axis]: { left, right } };
		},
		{} as Record<Axis, AxisScore>,
	);

	for (const axis of AXES) {
		const { left, right } = axisScores[axis];
		if (left + right === 0) {
			throw new IncompleteAnswersError(`axis ${axis} received no answers`);
		}
	}

	const type = AXES.map((axis) => {
		const { left, right } = axisScores[axis];
		const pair = AXIS_LETTERS[axis];
		if (left === right) {
			return DEFAULT_DIRECTION[axis] === 'left' ? pair.left : pair.right;
		}
		return left > right ? pair.left : pair.right;
	}).join('');

	return { type, axisScores };
}
