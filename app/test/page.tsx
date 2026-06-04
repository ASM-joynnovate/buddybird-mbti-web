'use client'

// Test (Quiz) — faithful recreation of the Claude Design bundle Quiz ("동화숲 월드"):
// a segmented progress bar that fills with each answered axis hue, a back/exit link,
// an emoji-led question card, and two 🅰/🅱 option buttons tinted by their axis-letter
// color. Selecting an option bounces + stamps a check, then auto-advances. All engine
// logic is unchanged (useTestProgress, computeResult, encodeResult, analytics); only
// the presentation is reskinned.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { LETTER_COLOR, QUESTION_COUNT, QUESTIONS } from '@/content'
import { track } from '@/lib/analytics'
import { computeResult, type Choice } from '@/lib/mbti'
import { encodeResult, RESULT_PARAM } from '@/lib/result-url'
import { useTestProgress } from '@/lib/state/test-progress-context'
import './test.css'

export default function TestPage() {
    const router = useRouter()
    const { answers, currentIndex, answer, setIndex, goBack, setResult } = useTestProgress()

    // Local select state for the design's pick → check/bounce → auto-advance feel.
    // `picked` holds the chosen choice id during the brief transition window.
    const [picked, setPicked] = useState<string | null>(null)
    const [direction, setDirection] = useState<'r' | 'l'>('r')
    const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (advanceTimer.current !== null) {
                clearTimeout(advanceTimer.current)
            }
        }
    }, [])

    const question = QUESTIONS[currentIndex]

    // Safe fallback: empty content or an out-of-range index must not crash.
    if (question === undefined) {
        return (
            <main data-testid="test-root" className="test-surface test-surface--empty">
                <p style={{ color: 'var(--color-ink-muted)' }}>표시할 문항이 없습니다.</p>
            </main>
        )
    }

    const isLast = currentIndex === QUESTION_COUNT - 1

    const handleChoice = (choice: Choice) => {
        if (picked !== null) {
            return
        }
        setPicked(choice.id)
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

        const reduce =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const delay = reduce ? 120 : 420

        advanceTimer.current = setTimeout(() => {
            if (!isLast) {
                setDirection('r')
                setPicked(null)
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
                router.push(
                    `/result/?${RESULT_PARAM}=${encodeResult(result.type, result.axisScores)}`,
                )
            } catch {
                setPicked(null)
                setIndex(0)
                router.push('/')
            }
        }, delay)
    }

    const handleBack = () => {
        if (advanceTimer.current !== null) {
            clearTimeout(advanceTimer.current)
        }
        setPicked(null)
        if (currentIndex === 0) {
            router.push('/')
            return
        }
        setDirection('l')
        goBack()
    }

    return (
        <main data-testid="test-root" className="test-surface">
            <div className="quiz-meta">
                <button
                    type="button"
                    data-testid="back-button"
                    onClick={handleBack}
                    className="quiz-back"
                >
                    <span aria-hidden="true">←</span>
                    {currentIndex === 0 ? '나가기' : '이전'}
                </button>
                <span>
                    {currentIndex + 1} / {QUESTION_COUNT}
                </span>
            </div>

            <div
                className="progress"
                data-testid="progress"
                role="progressbar"
                aria-label="테스트 진행률"
                aria-valuemin={1}
                aria-valuemax={QUESTION_COUNT}
                aria-valuenow={currentIndex + 1}
                aria-valuetext={`${QUESTION_COUNT}문항 중 ${currentIndex + 1}번째`}
            >
                {QUESTIONS.map((q, i) => {
                    const ans = answers[q.id]
                    const fillColor = ans ? LETTER_COLOR[ans.letter] : null
                    const width = ans ? '100%' : i === currentIndex ? '14%' : '0'
                    return (
                        <span className="seg" key={q.id} aria-hidden="true">
                            <i style={{ width, background: fillColor ?? 'var(--color-outline)' }} />
                        </span>
                    )
                })}
            </div>

            <div className={`q-card slide-in-${direction}`} key={currentIndex}>
                <div className="q-emoji" aria-hidden="true">
                    {question.emoji}
                </div>
                <h1 className="q-text font-display">{question.text}</h1>

                <div className="opts">
                    {question.choices.map((choice, i) => {
                        const color = LETTER_COLOR[choice.letter]
                        const isPicked = picked === choice.id
                        return (
                            <button
                                key={choice.id}
                                type="button"
                                // During the select window the choice- testid is swapped off so
                                // the E2E poller waits for the next question instead of clicking
                                // the now-disabled button.
                                data-testid={
                                    picked !== null ? `opt-${choice.id}` : `choice-${choice.id}`
                                }
                                aria-label={choice.label}
                                onClick={() => handleChoice(choice)}
                                disabled={picked !== null}
                                // Full class string per branch: prettier-plugin-tailwindcss
                                // trims a leading space inside a ternary fragment (which
                                // silently collapsed `opt is-selected` → `optis-selected`),
                                // but it always preserves the space *between* two classes.
                                className={isPicked ? 'opt is-selected' : 'opt'}
                                style={{ '--ax': color } as CSSProperties}
                            >
                                <span
                                    className="opt-badge"
                                    style={{ background: `${color}22`, color }}
                                    aria-hidden="true"
                                >
                                    {i === 0 ? '🅰' : '🅱'}
                                </span>
                                <span className="opt-label">{choice.label}</span>
                                {isPicked && (
                                    <span className="opt-check" aria-hidden="true">
                                        ✓
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
