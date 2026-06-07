'use client'

// Test (Quiz) — 동화숲 월드 v2 presentation: a round back button + a single
// cream progress pill (gold→orange gradient fill, Motion width tween) + the Jua
// count pill on one row, the Quest Sheet question card (pinned parchment:
// brass pin, "No.n" eyebrow, postage-stamp emoji tile, Jua 24px question —
// winner of the 2026-06-07 question-presentation prototype round), and the
// outline A/B choice rows: hook punch line over body description, both in
// NEXON Lv2 Gothic, with the "도장 쾅" tap feedback — press-in, spring
// rebound, check stamp slamming onto the letter tile with an ink ring
// (winner of the 2026-06-07 Choice Row prototype round). All engine logic is
// unchanged (useTestProgress, computeResult, encodeResult, analytics); only the
// presentation is reskinned — the 420ms (reduced-motion 120ms) auto-advance
// stays a setTimeout: the timer is the engine's pacing contract and must not
// depend on animation completion.
// Rendered by the server-component shell in app/test/page.tsx — same screen
// composition pattern as intro-view / result-view (ADR-0010).
import { useEffect, useRef, useState } from 'react'
import localFont from 'next/font/local'
import { useRouter } from 'next/navigation'
import { AnimatePresence, m, useReducedMotion, type Variants } from 'motion/react'
import { QUESTION_COUNT, QUESTIONS } from '@/content'
import { useTestProgress } from '@/features/quiz/test-progress-context'
import { computeResult, type Choice } from '@/lib/mbti'
import { encodeResult, RESULT_PARAM } from '@/lib/result-url'
import { track } from '@/shared/analytics'
import { easeLeaf, easeSpring, fadeOnly, popIn } from '@/shared/motion'
import { GameButton } from '@/shared/ui/game-button'
import { GamePanel } from '@/shared/ui/game-panel'
import { GamePill } from '@/shared/ui/game-pill'

// NEXON Lv2 Gothic — Choice hook/body only (loaded on /test alone). License
// requires the files be embedded UNMODIFIED — never subset (fonts/README.md).
// preload:false + swap: the copy renders in the sans fallback and swaps in;
// the LCP-critical landing route is untouched.
const nexon = localFont({
    src: [
        { path: './fonts/NEXONLv2Gothic-Regular.woff2', weight: '400' },
        { path: './fonts/NEXONLv2Gothic-Bold.woff2', weight: '700' },
    ],
    display: 'swap',
    preload: false,
    variable: '--font-nexon',
})

// Progressive-enhancement haptic tick on choice tap (Android only; iOS
// Safari no-ops). Never load-bearing.
function buzz() {
    try {
        navigator.vibrate?.(12)
    } catch {
        /* unsupported — fine */
    }
}

type Direction = 'r' | 'l'

// Direction-aware question-card transition. `custom` carries the navigation
// direction: advancing ('r') slides the next card in from the right while the
// old one exits left; going back ('l') mirrors it. The exit leg is brief and
// sets pointer-events:none so the outgoing card (kept in the DOM by
// AnimatePresence mode="wait") can never swallow a tap meant for the next one.
const cardVariants: Variants = {
    enter: (direction: Direction) => ({ opacity: 0, x: direction === 'r' ? 18 : -18 }),
    center: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.36, ease: easeSpring },
    },
    exit: (direction: Direction) => ({
        opacity: 0,
        x: direction === 'r' ? -14 : 14,
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

// Choice press-in — deeper sink than before (y4/0.97): the press and the
// stamp-slam rebound together make the tap read as an event, not a state
// fade (2026-06-07 Choice Row prototype round, recipe "도장 쾅").
const choiceTap = { y: 4, scale: 0.97, transition: { duration: 0.09, ease: easeLeaf } }

// Full class string per state (prettier-plugin-tailwindcss compatible — no
// conditional fragments). Type lives on the inner hook/body spans.
const CHOICE_CLASS =
    'relative flex cursor-pointer items-center gap-3.5 rounded-lg border-2 border-border-action bg-surface-cream px-4 py-3.5 text-left text-ink shadow-[0_5px_0_var(--color-depth-action),0_12px_22px_-14px_rgba(58,46,26,0.35)] transition-[border-color,background-color,box-shadow] duration-150 ease-leaf hover:border-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel disabled:cursor-not-allowed'
const CHOICE_PICKED_CLASS =
    'relative flex cursor-pointer items-center gap-3.5 rounded-lg border-2 border-primary bg-[#fff7ec] px-4 py-3.5 text-left text-ink shadow-[0_1px_0_var(--color-depth-action),0_0_0_3px_var(--color-primary-glow)] transition-[border-color,background-color,box-shadow] duration-150 ease-leaf focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel disabled:cursor-not-allowed'

const LETTER_CLASS =
    'grid size-10 flex-none place-items-center rounded-sm border-2 border-primary bg-white font-display text-lg leading-none text-primary-active shadow-[0_2px_0_var(--color-depth-action)] transition-[background-color,color] duration-150 ease-leaf'
const LETTER_PICKED_CLASS =
    'grid size-10 flex-none place-items-center rounded-sm border-2 border-primary bg-primary font-display text-lg leading-none text-on-primary shadow-raise-bar-primary transition-[background-color,color] duration-150 ease-leaf'

export function TestView() {
    const router = useRouter()
    const { answers, currentIndex, answer, setIndex, goBack, setResult } = useTestProgress()
    const reducedMotion = useReducedMotion()

    // Local select state for the design's pick → press → auto-advance feel.
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
            <main
                data-testid="test-root"
                className="flex min-h-dvh flex-col items-center justify-center px-gutter"
            >
                <p className="text-ink-muted">표시할 문항이 없습니다.</p>
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

    // Single pill fill: answered questions out of total (the current question
    // counts the moment it's picked) — a one-shot Motion width tween per step.
    const filled = currentIndex + (picked !== null ? 1 : 0)
    const pct = Math.round((filled / QUESTION_COUNT) * 100)

    return (
        <main
            data-testid="test-root"
            className={`relative flex min-h-dvh flex-col px-gutter pt-15 pb-10 ${nexon.variable}`}
        >
            <div className="flex items-center gap-3">
                <GameButton
                    variant="icon"
                    data-testid="back-button"
                    onClick={handleBack}
                    aria-label={currentIndex === 0 ? '나가기' : '이전 문항'}
                >
                    ←
                </GameButton>

                <div
                    className="h-4 flex-1 overflow-hidden rounded-full border-2 border-border-action bg-surface-cream shadow-inset-track"
                    data-testid="progress"
                    role="progressbar"
                    aria-label="테스트 진행률"
                    aria-valuemin={1}
                    aria-valuemax={QUESTION_COUNT}
                    aria-valuenow={currentIndex + 1}
                    aria-valuetext={`${QUESTION_COUNT}문항 중 ${currentIndex + 1}번째`}
                >
                    <m.div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-gold),var(--color-primary))] shadow-inset-highlight"
                        initial={false}
                        animate={{ width: `${pct}%` }}
                        transition={
                            reducedMotion ? { duration: 0.08 } : { duration: 0.5, ease: easeSpring }
                        }
                    />
                </div>

                <GamePill bare className="px-3 py-1 font-display text-base text-ink">
                    <b className="font-normal text-primary">{currentIndex + 1}</b>
                    &nbsp;/ {QUESTION_COUNT}
                </GamePill>
            </div>

            {/* mode="wait": the outgoing card fully exits before the next mounts, so
                the flex column never stacks two cards (no layout jump, no popLayout —
                which would need the heavier domMax feature bundle). */}
            <AnimatePresence mode="wait" custom={direction}>
                <m.div
                    className="flex min-h-0 flex-1 flex-col"
                    key={currentIndex}
                    custom={direction}
                    variants={reducedMotion ? cardVariantsReduced : cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                >
                    {/* Quest Sheet — the question as a parchment commission notice
                        pinned to the forest: brass pin, slight tilt, "No.n" eyebrow,
                        and the question emoji as a tilted postage-stamp tile. */}
                    <div className="relative mt-8 -rotate-[1.2deg]">
                        <span
                            aria-hidden="true"
                            className="absolute -top-2.5 left-1/2 z-1 size-5 -translate-x-1/2 rounded-full border-2 border-primary-active bg-[radial-gradient(circle_at_35%_30%,#ffe2c8,var(--color-gold)_55%,var(--color-primary-hover))] shadow-[0_3px_4px_rgba(58,46,26,0.35)]"
                        />
                        <GamePanel dashedFrame className="px-6 py-7">
                            <div className="flex items-center justify-between gap-3">
                                <p className="m-0 font-display text-3xl leading-none text-primary">
                                    No.{currentIndex + 1}
                                </p>
                                <m.span
                                    aria-hidden="true"
                                    className="grid size-14 rotate-6 place-items-center rounded-sm border-2 border-dashed border-primary bg-primary-soft text-3xl shadow-[0_2px_0_var(--color-depth-action)]"
                                    variants={reducedMotion ? fadeOnly : popIn}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {question.emoji}
                                </m.span>
                            </div>
                            <h1 className="m-0 mt-4 font-display text-2xl leading-[1.4] break-keep whitespace-pre-line text-ink">
                                {question.text}
                            </h1>
                        </GamePanel>
                    </div>

                    <div className="mt-auto flex flex-col gap-3.5 pt-5">
                        {question.choices.map((choice, i) => {
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
                                    onClick={() => {
                                        buzz()
                                        handleChoice(choice)
                                    }}
                                    disabled={picked !== null}
                                    className={isPicked ? CHOICE_PICKED_CLASS : CHOICE_CLASS}
                                    whileTap={interactive ? choiceTap : undefined}
                                    // Stamp-slam rebound: the row never holds the pressed pose
                                    // (a 300ms+ hold reads as jank against the 420ms advance) —
                                    // it springs back while the stamp carries "selected".
                                    animate={
                                        isPicked && !reducedMotion
                                            ? { y: [4, 0], scale: [0.97, 1] }
                                            : { y: 0 }
                                    }
                                    transition={{ duration: 0.2, ease: easeSpring }}
                                >
                                    {/* Plain A/B letter tiles — never MBTI axis tags (DESIGN.md). */}
                                    <span className="relative flex-none" aria-hidden="true">
                                        <span
                                            className={
                                                isPicked ? LETTER_PICKED_CLASS : LETTER_CLASS
                                            }
                                        >
                                            {i === 0 ? 'A' : 'B'}
                                        </span>
                                        {isPicked && (
                                            <>
                                                {/* Check stamp slams onto the tile (1.45→1, −8°→−3°). */}
                                                <m.span
                                                    className="absolute inset-0 grid place-items-center rounded-sm bg-primary text-xl leading-none font-bold text-on-primary shadow-raise-bar-primary"
                                                    initial={
                                                        reducedMotion
                                                            ? { opacity: 1, rotate: -3 }
                                                            : {
                                                                  scale: 1.45,
                                                                  rotate: -8,
                                                                  opacity: 0,
                                                              }
                                                    }
                                                    animate={{ scale: 1, rotate: -3, opacity: 1 }}
                                                    transition={{
                                                        duration: 0.23,
                                                        ease: easeSpring,
                                                    }}
                                                >
                                                    ✓
                                                </m.span>
                                                {/* Ink ring puffs out and fades. */}
                                                {!reducedMotion && (
                                                    <m.span
                                                        className="absolute -inset-1.5 rounded-lg border-2 border-primary"
                                                        initial={{ scale: 0.8, opacity: 0.6 }}
                                                        animate={{ scale: 1.3, opacity: 0 }}
                                                        transition={{
                                                            duration: 0.25,
                                                            ease: easeLeaf,
                                                        }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </span>
                                    {/* Hook (punch line) over body (description) — NEXON Lv2
                                        Gothic carries both; label is the fallback when a
                                        choice has no split. */}
                                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 [font-family:var(--font-nexon),var(--font-sans)] break-keep">
                                        <b className="text-[1.0625rem] leading-snug font-bold text-ink">
                                            {choice.hook ?? choice.label}
                                        </b>
                                        {choice.body !== undefined && (
                                            <span className="text-sm leading-normal font-normal text-ink-muted">
                                                {choice.body}
                                            </span>
                                        )}
                                    </span>
                                </m.button>
                            )
                        })}
                    </div>
                </m.div>
            </AnimatePresence>
        </main>
    )
}
