'use client'

// Intro (Landing) — the 동화숲 월드 v2 hero: headline with the gold-marker
// highlight, the BackStack trading-card deck (auto-advance + tap → detail
// popup + scrub → full deck overlay), then deck button / hero stats / pulsing
// CTA pinned to the bottom. The screen is a fixed h-dvh stage
// (overflow-hidden) so the deck scrub gesture never fights page scroll.
// Rendered by the server-component shell in page.tsx, which owns the route
// metadata (a 'use client' page cannot export it).
import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { CAROUSEL_TYPES, QUESTION_COUNT } from '@/content'
import { BackStack, type BackStackControls } from '@/features/deck/back-stack'
import { DeckOverlay, useDeckController } from '@/features/deck/deck-overlay'
import { useTestProgress } from '@/features/quiz/test-progress-context'
import type { TypeCode } from '@/lib/mbti'
import { track } from '@/shared/analytics'
import { fadeOnly, fadeUp, staggerContainer } from '@/shared/motion'
import { GameButton } from '@/shared/ui/game-button'
import { GamePill } from '@/shared/ui/game-pill'

// Detail popup is tap-only UI — code-split out of the initial bundle and
// fetched on the first card tap (it only ever renders when `detail` is set).
const DetailPopup = dynamic(
    () => import('@/features/deck/detail-popup').then((mod) => mod.DetailPopup),
    { ssr: false },
)

// Stack order: a curated lead-in, then the remaining types (mirrors the bundle).
const STACK_LEAD: readonly TypeCode[] = [
    'ENFP',
    'INTJ',
    'ESFP',
    'ISFP',
    'ENTP',
    'INFJ',
    'ENTJ',
    'ISFJ',
]
const STACK_POOL: readonly TypeCode[] = [
    ...STACK_LEAD,
    ...CAROUSEL_TYPES.filter((code) => !STACK_LEAD.includes(code)),
]

export function IntroView() {
    const router = useRouter()
    const { reset, setIndex } = useTestProgress()
    const reducedMotion = useReducedMotion()

    const deck = useDeckController()
    const stackControls = useRef<BackStackControls | null>(null)
    const [detail, setDetail] = useState<TypeCode | null>(null)

    // Intro entrance: the hero groups stagger in with the shared fadeUp;
    // degrades to opacity-only under prefers-reduced-motion.
    const entrance = reducedMotion ? fadeOnly : fadeUp

    const handleStart = () => {
        reset()
        setIndex(0)
        track({ name: 'test_start', payload: {} })
        router.push('/test')
    }

    // Detail popup CTA: surface that type on the hero stack.
    const handlePickHome = () => {
        if (detail !== null) {
            stackControls.current?.setActive(detail)
        }
        setDetail(null)
        deck.close()
    }

    return (
        <main
            data-testid="intro-root"
            className="relative flex h-dvh flex-col items-center overflow-hidden px-gutter pt-[clamp(5.25rem,12dvh,7rem)] pb-[clamp(2.5rem,9dvh,5.5rem)] text-center"
        >
            <m.div
                className="flex min-h-0 w-full flex-1 flex-col items-center"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {/* Group 1 — headline + back stack (pinned to the top). */}
                <m.div className="flex w-full flex-col items-center gap-4" variants={entrance}>
                    <h1 className="isolate m-0 font-display text-[clamp(2.125rem,11vw,2.875rem)] leading-[1.08] text-ink [text-shadow:0_2px_0_var(--color-surface-cream),0_0_16px_rgba(255,248,227,0.9)]">
                        우리 앵무새
                        <br />
                        <span className="whitespace-nowrap">
                            <span className="relative whitespace-nowrap text-primary-active after:absolute after:-right-[4%] after:bottom-[4%] after:-left-[4%] after:-z-10 after:h-[40%] after:-rotate-[1.5deg] after:rounded-full after:bg-[linear-gradient(180deg,var(--color-primary-glow),var(--color-gold))] after:opacity-85 after:content-['']">
                                진짜 성격
                            </span>
                            은?
                        </span>
                    </h1>

                    <BackStack
                        pool={STACK_POOL}
                        intervalMs={3000}
                        controller={deck}
                        onCardTap={setDetail}
                        paused={detail !== null}
                        controlsRef={stackControls}
                    />
                </m.div>

                {/* Group 2 — deck entry + stats + primary CTA (settle at the bottom). */}
                <m.div
                    className="mt-auto flex w-full flex-col items-center gap-4 pt-4"
                    variants={entrance}
                >
                    <GameButton
                        variant="secondary"
                        data-testid="deck-button"
                        onClick={deck.openAnimated}
                    >
                        🗂 16유형 모두 보기
                    </GameButton>

                    <GamePill
                        bare
                        className="items-stretch gap-[clamp(0.625rem,4vw,1.125rem)] px-[clamp(1rem,6vw,1.625rem)] py-3 text-sm font-semibold text-ink-muted"
                        data-testid="hero-stats"
                    >
                        <span className="flex flex-col items-center whitespace-nowrap">
                            <b className="font-display text-xl leading-none font-normal text-primary">
                                16
                            </b>
                            유형
                        </span>
                        <i className="w-0.5 rounded-xs bg-border-action" aria-hidden="true" />
                        <span className="flex flex-col items-center whitespace-nowrap">
                            <b className="font-display text-xl leading-none font-normal text-primary">
                                {QUESTION_COUNT}
                            </b>
                            질문
                        </span>
                        <i className="w-0.5 rounded-xs bg-border-action" aria-hidden="true" />
                        <span className="flex flex-col items-center whitespace-nowrap">
                            <b className="font-display text-xl leading-none font-normal text-primary">
                                1분
                            </b>
                            소요
                        </span>
                    </GamePill>

                    <div className="relative isolate flex w-full justify-center">
                        {/* Pulsing halo behind the CTA — decoration, dropped under
                            reduced motion. Radial alpha is required here (a glow over
                            the forest backdrop has no opaque mix target). */}
                        {!reducedMotion && (
                            <m.span
                                className="pointer-events-none absolute inset-x-0 -inset-y-1.5 -z-10 mx-auto w-full max-w-[22rem] rounded-full bg-[radial-gradient(closest-side,rgba(232,119,46,0.35),transparent)]"
                                animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.98, 1.04, 0.98] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                aria-hidden="true"
                            />
                        )}
                        <GameButton
                            data-testid="start-button"
                            onClick={handleStart}
                            className="w-full max-w-[21.25rem]"
                        >
                            테스트 시작하기 <span aria-hidden="true">→</span>
                        </GameButton>
                    </div>
                </m.div>
            </m.div>

            <DeckOverlay controller={deck} onSelect={setDetail} />

            <AnimatePresence>
                {detail !== null && (
                    <DetailPopup
                        code={detail}
                        onClose={() => setDetail(null)}
                        onSelectType={setDetail}
                        cta={{ label: '이 친구 홈에서 보기', onClick: handlePickHome }}
                    />
                )}
            </AnimatePresence>
        </main>
    )
}
