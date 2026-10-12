import {
	AXES,
	AXIS_LETTERS,
	type Answer,
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

const LETTER_AXIS = Object.fromEntries(
	AXES.flatMap((axis) => [
		[AXIS_LETTERS[axis].left, axis],
		[AXIS_LETTERS[axis].right, axis],
	]),
) as Record<Letter, Axis>;

// Equal points on both axes of a choice couple the axes and skew results toward a few types.
// The question's primary axis carries the weight; the secondary axis only breaks close calls.
const PRIMARY_POINTS = 3;
const SECONDARY_POINTS = 1;

// Species adds at most one unit per axis, toward the side it leans.
const SPECIES_POINTS = 3;

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

export function computeResult(answers: Answer[], speciesWeights: Partial<Record<Letter, number>> = {}): ComputeResult {
	if (!Array.isArray(answers) || answers.length === 0) {
		throw new IncompleteAnswersError('answers must be a non-empty array');
	}

	answers.forEach((entry, index) => {
		if (entry == null || !AXES.includes(entry.primaryAxis) || !isValidChoice(entry.choice)) {
			throw new IncompleteAnswersError(`answer at index ${index} is not a valid Answer`);
		}
	});

	const questionScores = AXES.reduce<Record<Axis, AxisScore>>(
		(scores, axis) => ({ ...scores, [axis]: { left: 0, right: 0 } }),
		{} as Record<Axis, AxisScore>,
	);
	for (const { primaryAxis, choice } of answers) {
		for (const [letter, weight] of Object.entries(choice.weights) as [Letter, number][]) {
			const axis = LETTER_AXIS[letter];
			const points = weight * (axis === primaryAxis ? PRIMARY_POINTS : SECONDARY_POINTS);
			const side = AXIS_LETTERS[axis].left === letter ? 'left' : 'right';
			questionScores[axis][side] += points;
		}
	}

	for (const axis of AXES) {
		const { left, right } = questionScores[axis];
		if (left + right === 0) {
			throw new IncompleteAnswersError(`axis ${axis} received no answers`);
		}
	}

	const axisScores = AXES.reduce<Record<Axis, AxisScore>>(
		(scores, axis) => {
			const { left: leftLetter, right: rightLetter } = AXIS_LETTERS[axis];
			const lean = Math.sign((speciesWeights[leftLetter] ?? 0) - (speciesWeights[rightLetter] ?? 0));
			const { left, right } = questionScores[axis];
			return {
				...scores,
				[axis]: {
					left: left + (lean > 0 ? SPECIES_POINTS : 0),
					right: right + (lean < 0 ? SPECIES_POINTS : 0),
				},
			};
		},
		{} as Record<Axis, AxisScore>,
	);

	const type = AXES.map((axis) => {
		const pair = AXIS_LETTERS[axis];
		const total = axisScores[axis];
		const questions = questionScores[axis];
		// A tie caused by the species bonus falls back to the question scores.
		const diff = total.left !== total.right ? total.left - total.right : questions.left - questions.right;
		if (diff === 0) {
			return DEFAULT_DIRECTION[axis] === 'left' ? pair.left : pair.right;
		}
		return diff > 0 ? pair.left : pair.right;
	}).join('');

	return { type, axisScores };
}
