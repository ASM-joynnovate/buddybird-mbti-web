export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

export type Letter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type TypeCode = string;

export const AXES: readonly Axis[] = ['EI', 'SN', 'TF', 'JP'];

export const AXIS_LETTERS: Record<Axis, { left: Letter; right: Letter }> = {
	EI: { left: 'E', right: 'I' },
	SN: { left: 'S', right: 'N' },
	TF: { left: 'T', right: 'F' },
	JP: { left: 'J', right: 'P' },
};

export interface Choice {
	id: string;
	label: string;
	hook?: string;
	body?: string;
	weights: Partial<Record<Letter, number>>;
}

export interface Question {
	id: string;
	emoji: string;
	text: string;
	choices: [Choice, Choice];
}

export interface TypeInfo {
	code: TypeCode;
	name: string;
	report: string;
	description: string;
	colors: readonly [string, string];
	match: readonly [TypeCode, TypeCode];
}

export interface AxisScore {
	left: number;
	right: number;
}

export interface ComputeResult {
	type: TypeCode;
	axisScores: Record<Axis, AxisScore>;
}
