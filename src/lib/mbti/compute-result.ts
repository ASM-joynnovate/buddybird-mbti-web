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

// 선택지는 두 축에 점수를 주는데, 같은 점수를 주면 축끼리 함께 움직여 특정 유형으로 쏠린다.
// 문항의 주축에 무게를 두고 보조축은 동점을 가르는 정도로만 반영한다.
const PRIMARY_POINTS = 3;
const SECONDARY_POINTS = 1;

// 종 가중치는 축마다 한 방향으로 최대 1단위만 더한다.
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
		// 종 가중치로 동점이 되면 문항 점수로 가른다.
		const diff = total.left !== total.right ? total.left - total.right : questions.left - questions.right;
		if (diff === 0) {
			return DEFAULT_DIRECTION[axis] === 'left' ? pair.left : pair.right;
		}
		return diff > 0 ? pair.left : pair.right;
	}).join('');

	return { type, axisScores };
}
