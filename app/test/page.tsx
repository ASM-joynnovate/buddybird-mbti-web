'use client'

// Test (Quiz) — faithful recreation of the Claude Design bundle Quiz ("동화숲 월드"):
// a segmented progress bar that fills with each answered axis hue, a back/exit link,
// an emoji-led question card, and two 🅰/🅱 option buttons tinted by their axis-letter
// color. Selecting an option bounces + stamps a check, then auto-advances. All engine
// logic is unchanged (useTestProgress, computeResult, encodeResult, analytics); only
// the presentation is reskinned.
//
// Motion pass (issue #23, ADR-0006): question-card transitions run through
// AnimatePresence (direction-aware enter/exit instead of the slideInL/R
// keyframes), the option cards wear the game-card vocabulary with Motion
// hover/tap/bounce feedback, the check stamp pops in via popIn, and the
// progress fill is a Motion-driven width tween. The 420ms (reduced-motion
// 120ms) auto-advance stays a setTimeout: the timer is the engine's pacing
// contract and must not depend on animation completion (an interrupted or
// degraded transition must never stall the quiz).
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, m, useReducedMotion, type Variants } from 'motion/react'
import { GameButton } from '@/components/game-button'
import { QUESTION_COUNT, QUESTIONS } from '@/content'
import { track } from '@/lib/analytics'
import { computeResult, type Choice } from '@/lib/mbti'
import { easeLeaf, easeSpring, fadeOnly, popIn } from '@/lib/motion'
import { encodeResult, RESULT_PARAM } from '@/lib/result-url'
import { useTestProgress } from '@/lib/state/test-progress-context'
import './test.css'

type Direction = 'r' | 'l'

// Direction-aware question-card transition. `custom` carries the navigation
// direction: advancing ('r') slides the next card in from the right while the
// old one exits left; going back ('l') mirrors it. The exit leg is brief and
// sets pointer-events:none so the outgoing card (kept in the DOM by
// AnimatePresence mode="wait") can never swallow a tap meant for the next one.
const cardVariants: Variants = {
    enter: (direction: Direction) => ({ opacity: 0, x: direction === 'r' ? 60 : -60 }),
    center: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: easeSpring },
    },
    exit: (direction: Direction) => ({
        opacity: 0,
        x: direction === 'r' ? -42 : 42,
        pointerEvents: 'none',
        transition: { duration: 0.16, ease: easeLeaf },
    }),
}

// Reduced motion: the card swap degrades to a quick cross-fade — no
// translation, no spring — while the flow itself (auto-advance, back) is
// untouched.
const cardVariantsReduced: Variants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.12 } },
    exit: { opacity: 0, pointerEvents: 'none', transition: { duration: 0.08 } },
}

// Selection bounce (replaces the CSS `bounce` keyframe): same 0/40/70/100%
// scale envelope, Motion-owned so it composes with whileTap/whileHover.
const optionBounce: Variants = {
    idle: { scale: 1 },
    selected: {
        scale: [1, 1.06, 0.97, 1],
        transition: { duration: 0.5, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' },
    },
}

// Option card press/hover — issue #21 vocabulary (cardTap 0.98 / cardHover
// 1.01) but defined locally with the option's springier feel.
const optionTap = { scale: 0.98, transition: { duration: 0.2, ease: easeLeaf } }
const optionHover = { scale: 1.015, y: -3, transition: { duration: 0.26, ease: easeLeaf } }

// Decorative 🅰/🅱 option accents. With multi-axis weighted choices (ADR-0003) a
// choice no longer maps to a single axis letter, so the tint is purely a visual A/B
// distinction — not a semantic axis hue. The badge wash is an OPAQUE color-mix
// into the cream surface (chrome carries no alpha by rule — DESIGN.md).
const OPTION_ACCENTS = ['#e8772e', '#7b3fb5'] as const

export default function TestPage() {
    const router = useRouter()
    const { answers, currentIndex, answer, setIndex, goBack, setResult } = useTestProgress()
    const reducedMotion = useReducedMotion()

    // Local select state for the design's pick → check/bounce → auto-advance feel.
    // `picked` holds the chosen choice id during the brief transition window.
    const [picked, setPicked] = useState<string | null>(null)
    const [direction, setDirection] = useState<Direction>('r')
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
                {/* secondary --sm (not ghost): the transparent ghost skin was
                    unreadable over the dark canopy backdrop (issue #27 gate). */}
                <GameButton
                    variant="secondary"
                    size="sm"
                    data-testid="back-button"
                    onClick={handleBack}
                >
                    <span aria-hidden="true">←</span>
                    {currentIndex === 0 ? '나가기' : '이전'}
                </GameButton>
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
                    // Answered segments fill with the picked side's accent (🅰/🅱), mirroring
                    // the option badges. Choices are multi-axis now (ADR-0003), so the tint
                    // reflects which side was chosen — not a single axis hue.
                    const ans = answers[q.id]
                    const pickedIndex = ans ? q.choices.findIndex((c) => c.id === ans.id) : -1
                    const width = ans ? '100%' : i === currentIndex ? '14%' : '0%'
                    const background =
                        pickedIndex >= 0
                            ? (OPTION_ACCENTS[pickedIndex] ?? OPTION_ACCENTS[0])
                            : 'var(--color-outline)'
                    return (
                        <span className="seg" key={q.id} aria-hidden="true">
                            {/* One-shot fill: Motion-owned width tween (non-continuous,
                                so width is acceptable here — issue #23). initial={false}
                                keeps restored sessions from replaying every fill. */}
                            <m.i
                                initial={false}
                                animate={{ width }}
                                transition={
                                    reducedMotion
                                        ? { duration: 0.08 }
                                        : { duration: 0.5, ease: easeSpring }
                                }
                                style={{ background }}
                            />
                        </span>
                    )
                })}
            </div>

            {/* mode="wait": the outgoing card fully exits before the next mounts, so
                the flex column never stacks two cards (no layout jump, no popLayout —
                which would need the heavier domMax feature bundle). */}
            <AnimatePresence mode="wait" custom={direction}>
                <m.div
                    className="q-card"
                    key={currentIndex}
                    custom={direction}
                    variants={reducedMotion ? cardVariantsReduced : cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                >
                    <div className="q-prompt">
                        <m.div
                            className="q-emoji"
                            aria-hidden="true"
                            variants={reducedMotion ? fadeOnly : popIn}
                            initial="hidden"
                            animate="visible"
                        >
                            {question.emoji}
                        </m.div>
                        <h1 className="q-text font-display">{question.text}</h1>
                    </div>

                    <div className="opts">
                        {question.choices.map((choice, i) => {
                            const color = OPTION_ACCENTS[i] ?? OPTION_ACCENTS[0]
                            const isPicked = picked === choice.id
                            const interactive = picked === null && !reducedMotion
                            return (
                                <m.button
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
                                    className={
                                        isPicked
                                            ? 'opt game-card game-card--selectable is-selected'
                                            : 'opt game-card game-card--selectable'
                                    }
                                    style={{ '--ax': color } as CSSProperties}
                                    // Hover/tap only while the option is still pickable, so the
                                    // selection bounce below is never overridden by a lingering
                                    // hover/tap target on the just-clicked card.
                                    whileHover={interactive ? optionHover : undefined}
                                    whileTap={interactive ? optionTap : undefined}
                                    variants={optionBounce}
                                    animate={isPicked && !reducedMotion ? 'selected' : 'idle'}
                                >
                                    <span
                                        className="opt-badge"
                                        style={{
                                            background: `color-mix(in srgb, ${color} 13%, var(--color-surface-cream))`,
                                            color,
                                        }}
                                        aria-hidden="true"
                                    >
                                        {i === 0 ? '🅰' : '🅱'}
                                    </span>
                                    <span className="opt-label">{choice.label}</span>
                                    {isPicked && (
                                        <m.span
                                            className="opt-check"
                                            aria-hidden="true"
                                            variants={reducedMotion ? fadeOnly : popIn}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            ✓
                                        </m.span>
                                    )}
                                </m.button>
                            )
                        })}
                    </div>
                </m.div>
            </AnimatePresence>
        </main>
    )
}
