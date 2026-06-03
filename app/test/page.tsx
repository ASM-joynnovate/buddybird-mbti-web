'use client'

import { useRouter } from 'next/navigation'
import { ChoiceButton } from '@/components/choice-button'
import { ProgressIndicator } from '@/components/progress-indicator'
import { QUESTION_COUNT, QUESTIONS } from '@/content'
import { track } from '@/lib/analytics'
import { computeResult, type Choice } from '@/lib/mbti'
import { encodeResult, RESULT_PARAM } from '@/lib/result-url'
import { useTestProgress } from '@/lib/state/test-progress-context'
import './test.css'

// Decorative feather hues (DESIGN.md temperament groups). Cycled per choice as a
// playful accent on the choice rows — not on the primary action affordance.
const FEATHERS = [
    'var(--color-group-ruby)',
    'var(--color-group-marigold)',
    'var(--color-group-teal)',
    'var(--color-group-cobalt)',
]

export default function TestPage() {
    const router = useRouter()
    const { answers, currentIndex, answer, setIndex, goBack, setResult } = useTestProgress()

    const question = QUESTIONS[currentIndex]

    // Safe fallback: empty content or an out-of-range index must not crash.
    if (question === undefined) {
        return (
            <main
                data-testid="test-root"
                className="test-surface flex flex-1 flex-col items-center justify-center"
            >
                <p style={{ color: 'var(--color-ink-muted)' }}>표시할 문항이 없습니다.</p>
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
        <main data-testid="test-root" className="test-surface">
            <div className="test-foliage" aria-hidden="true">
                <span className="test-leaf test-leaf--tr" />
                <span className="test-leaf test-leaf--bl" />
                <span className="test-leaf test-leaf--mid" />
            </div>

            <div data-testid="progress">
                <ProgressIndicator current={currentIndex + 1} total={QUESTION_COUNT} />
            </div>

            <div className="test-stage" key={currentIndex}>
                <div className="test-photo" aria-hidden="true">
                    <span className="test-photo-ph">
                        <svg
                            width="38"
                            height="38"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="5" width="18" height="14" rx="2.5" />
                            <circle cx="8.5" cy="10" r="1.6" />
                            <path d="M21 16.5l-5-4.5L5 19" />
                        </svg>
                        우리 새 사진이 들어갈 자리
                    </span>
                </div>

                <div className="test-card">
                    <p className="test-kicker">
                        문항 {currentIndex + 1} / {QUESTION_COUNT}
                    </p>
                    <h1 className="test-question font-display">{question.text}</h1>
                </div>

                <div className="test-choices">
                    {question.choices.map((choice, i) => (
                        <ChoiceButton
                            key={choice.id}
                            label={choice.label}
                            testId={`choice-${choice.id}`}
                            feather={FEATHERS[(currentIndex + i) % FEATHERS.length]}
                            onSelect={() => handleChoice(choice)}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    data-testid="back-button"
                    onClick={goBack}
                    disabled={currentIndex === 0}
                    className="test-back"
                >
                    ← 이전
                </button>
            </div>
        </main>
    )
}
