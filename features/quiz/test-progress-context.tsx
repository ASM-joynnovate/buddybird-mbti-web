'use client'

import {
    createContext,
    use,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    type ReactNode,
} from 'react'
import { type Choice, type ComputeResult } from '@/lib/mbti/types'
import { installAnalyticsTestHook } from '@/shared/analytics'

// State is keyed by questionId so this file never needs the questions list.
interface TestProgressState {
    answers: Record<string, Choice> // questionId -> chosen Choice
    currentIndex: number // index into the surface's question list
    result: ComputeResult | null
}

type TestProgressAction =
    | { type: 'answer'; questionId: string; choice: Choice }
    | { type: 'setIndex'; index: number }
    | { type: 'goBack' }
    | { type: 'setResult'; result: ComputeResult }
    | { type: 'reset' }

interface TestProgressValue extends TestProgressState {
    answer: (questionId: string, choice: Choice) => void
    setIndex: (index: number) => void
    goBack: () => void
    setResult: (result: ComputeResult) => void
    reset: () => void
}

// NOTE: refresh resets progress; session restore is deferred to #04.
const initialState: TestProgressState = {
    answers: {},
    currentIndex: 0,
    result: null,
}

// Immutable updates only: every branch returns a fresh state object.
function reducer(state: TestProgressState, action: TestProgressAction): TestProgressState {
    switch (action.type) {
        case 'answer':
            return {
                ...state,
                answers: { ...state.answers, [action.questionId]: action.choice },
            }
        case 'setIndex':
            return { ...state, currentIndex: action.index }
        case 'goBack':
            return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) }
        case 'setResult':
            return { ...state, result: action.result }
        case 'reset':
            return initialState
        default:
            return state
    }
}

const TestProgressContext = createContext<TestProgressValue | null>(null)

export function TestProgressProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)

    // Expose the E2E analytics capture hook on window once, app-wide.
    useEffect(() => {
        installAnalyticsTestHook()
    }, [])

    const answer = useCallback((questionId: string, choice: Choice) => {
        dispatch({ type: 'answer', questionId, choice })
    }, [])

    const setIndex = useCallback((index: number) => {
        dispatch({ type: 'setIndex', index })
    }, [])

    const goBack = useCallback(() => {
        dispatch({ type: 'goBack' })
    }, [])

    const setResult = useCallback((result: ComputeResult) => {
        dispatch({ type: 'setResult', result })
    }, [])

    const reset = useCallback(() => {
        dispatch({ type: 'reset' })
    }, [])

    const value = useMemo<TestProgressValue>(
        () => ({ ...state, answer, setIndex, goBack, setResult, reset }),
        [state, answer, setIndex, goBack, setResult, reset],
    )

    return <TestProgressContext.Provider value={value}>{children}</TestProgressContext.Provider>
}

export function useTestProgress(): TestProgressValue {
    const value = use(TestProgressContext)

    if (value === null) {
        throw new Error('useTestProgress must be used within a TestProgressProvider')
    }

    return value
}
