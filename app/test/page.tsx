'use client'

import { useRouter } from 'next/navigation'
import { ChoiceButton } from '@/components/choice-button'
import { ProgressIndicator } from '@/components/progress-indicator'
import { QUESTION_COUNT, QUESTIONS } from '@/content'
import { track } from '@/lib/analytics'
import { computeResult, type Choice } from '@/lib/mbti'
import { encodeResult, RESULT_PARAM } from '@/lib/result-url'
import { useTestProgress } from '@/lib/state/test-progress-context'

export default function TestPage() {
    const router = useRouter()
    const { answers, currentIndex, answer, setIndex, goBack, setResult } = useTestProgress()

    const question = QUESTIONS[currentIndex]

    // Safe fallback: empty content or an out-of-range index must not crash.
    if (question === undefined) {
        return (
            <main
                data-testid="test-root"
                className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16"
            >
                <p className="text-zinc-600">표시할 문항이 없습니다.</p>
            </main>
        )
    }

    const isLast = currentIndex === QUESTION_COUNT - 1

    const handleChoice = (choice: Choice) => {
        answer(question.id, choice)
        track({
            name: 'question_answered',
            payload: {
                questionId: question.id,
                choiceId: choice.id,
                axis: question.axis,
                index: currentIndex,
            },
        })

        if (!isLast) {
            setIndex(currentIndex + 1)
            return
        }

        // Merge the just-picked choice locally: the reducer state is not yet committed.
        const finalAnswers: Record<string, Choice> = { ...answers, [question.id]: choice }
        const orderedChoices = QUESTIONS.map((q) => finalAnswers[q.id])

        // computeResult throws IncompleteAnswersError on missing/invalid answers.
        // Guard the render boundary: never let it crash the page; restart instead.
        try {
            const result = computeResult(orderedChoices)
            setResult(result)
            track({ name: 'test_completed', payload: { type: result.type } })
            router.push(`/result/?${RESULT_PARAM}=${encodeResult(result.type)}`)
        } catch {
            setIndex(0)
            router.push('/')
        }
    }

    return (
        <main data-testid="test-root" className="flex flex-1 flex-col gap-8 px-6 py-12">
            <div data-testid="progress" className="text-sm text-zinc-500">
                <ProgressIndicator current={currentIndex + 1} total={QUESTION_COUNT} />
            </div>

            <h1 className="text-xl font-semibold">{question.text}</h1>

            <div className="flex flex-col gap-3">
                {question.choices.map((choice) => (
                    <ChoiceButton
                        key={choice.id}
                        label={choice.label}
                        testId={`choice-${choice.id}`}
                        onSelect={() => handleChoice(choice)}
                    />
                ))}
            </div>

            <button
                type="button"
                data-testid="back-button"
                onClick={goBack}
                disabled={currentIndex === 0}
                className="self-start text-sm text-zinc-500 disabled:opacity-40"
            >
                이전
            </button>
        </main>
    )
}
