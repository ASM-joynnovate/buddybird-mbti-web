'use client';

import { type ReactNode, createContext, use, useCallback, useMemo, useReducer } from 'react';

import { type Choice, type ComputeResult } from '@/types/mbti';

import { type Species } from '@/lib/mbti/species-weight';

interface TestProgressState {
	answers: Record<string, Choice>;
	currentIndex: number;
	result: ComputeResult | null;
	species: Species | null;
	speciesName: string | null;
}

type TestProgressAction =
	| { type: 'answer'; questionId: string; choice: Choice }
	| { type: 'setIndex'; index: number }
	| { type: 'goBack' }
	| { type: 'setResult'; result: ComputeResult }
	| { type: 'setSpecies'; species: Species; speciesName: string | null }
	| { type: 'reset' };

interface TestProgressValue extends TestProgressState {
	answer: (questionId: string, choice: Choice) => void;
	setIndex: (index: number) => void;
	goBack: () => void;
	setResult: (result: ComputeResult) => void;
	setSpecies: (species: Species, speciesName: string | null) => void;
	reset: () => void;
}

const initialState: TestProgressState = {
	answers: {},
	currentIndex: 0,
	result: null,
	species: null,
	speciesName: null,
};

function reducer(state: TestProgressState, action: TestProgressAction): TestProgressState {
	switch (action.type) {
		case 'answer':
			return {
				...state,
				answers: { ...state.answers, [action.questionId]: action.choice },
			};
		case 'setIndex':
			return { ...state, currentIndex: action.index };
		case 'goBack':
			return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) };
		case 'setResult':
			return { ...state, result: action.result };
		case 'setSpecies':
			return { ...state, species: action.species, speciesName: action.speciesName };
		case 'reset':
			return initialState;
		default:
			return state;
	}
}

const TestProgressContext = createContext<TestProgressValue | null>(null);

export function TestProgressProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState);

	const answer = useCallback((questionId: string, choice: Choice) => {
		dispatch({ type: 'answer', questionId, choice });
	}, []);

	const setIndex = useCallback((index: number) => {
		dispatch({ type: 'setIndex', index });
	}, []);

	const goBack = useCallback(() => {
		dispatch({ type: 'goBack' });
	}, []);

	const setResult = useCallback((result: ComputeResult) => {
		dispatch({ type: 'setResult', result });
	}, []);

	const setSpecies = useCallback((species: Species, speciesName: string | null) => {
		dispatch({ type: 'setSpecies', species, speciesName });
	}, []);

	const reset = useCallback(() => {
		dispatch({ type: 'reset' });
	}, []);

	const value = useMemo<TestProgressValue>(
		() => ({ ...state, answer, setIndex, goBack, setResult, setSpecies, reset }),
		[state, answer, setIndex, goBack, setResult, setSpecies, reset],
	);

	return <TestProgressContext.Provider value={value}>{children}</TestProgressContext.Provider>;
}

export function useTestProgress(): TestProgressValue {
	const value = use(TestProgressContext);

	if (value === null) {
		throw new Error('useTestProgress must be used within a TestProgressProvider');
	}

	return value;
}
