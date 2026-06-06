'use client'

// Intro (Landing) — the 동화숲 월드 v2 hero: headline with the gold-marker
// highlight, the BackStack trading-card deck (auto-advance + tap → detail
// popup + scrub → full deck overlay), then deck button / hero stats / pulsing
// CTA pinned to the bottom. The screen is a fixed h-dvh stage
// (overflow-hidden) so the deck scrub gesture never fights page scroll.
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { BackStack, type BackStackControls } from '@/components/back-stack'
import { DeckOverlay, useDeckController } from '@/components/deck-overlay'
import { DetailPopup } from '@/components/detail-popup'
import { GameButton } from '@/components/ui/game-button'
import { GamePill } from '@/components/ui/game-pill'
import { CAROUSEL_TYPES, QUESTION_COUNT } from '@/content'
import { track } from '@/lib/analytics'
import type { TypeCode } from '@/lib/mbti'
import { fadeOnly, fadeUp, staggerContainer } from '@/lib/motion'
import { useTestProgress } from '@/lib/state/test-progress-context'

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

export default function Home() {
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
            className="relative flex h-dvh flex-col items-center overflow-hidden px-gutter pt-[clamp(96px,15dvh,132px)] pb-10 text-center"
        >
            <m.div
                className="flex min-h-0 w-full flex-1 flex-col items-center"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {/* Group 1 — headline + back stack (pinned to the top). */}
                <m.div className="flex w-full flex-col items-center gap-[18px]" variants={entrance}>
                    <h1 className="isolate m-0 font-display text-[clamp(34px,11vw,46px)] leading-[1.08] tracking-[-0.01em] text-ink [text-shadow:0_2px_0_var(--color-surface-cream),0_0_16px_rgba(255,248,227,0.9)]">
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
                        className="items-stretch gap-[clamp(10px,4vw,18px)] px-[clamp(16px,6vw,26px)] py-[13px] text-[13px] font-semibold text-ink-muted"
                        data-testid="hero-stats"
                    >
                        <span className="flex flex-col items-center whitespace-nowrap">
                            <b className="font-display text-[21px] leading-none font-normal text-primary">
                                16
                            </b>
                            유형
                        </span>
                        <i className="w-0.5 rounded-[2px] bg-border-action" aria-hidden="true" />
                        <span className="flex flex-col items-center whitespace-nowrap">
                            <b className="font-display text-[21px] leading-none font-normal text-primary">
                                {QUESTION_COUNT}
                            </b>
                            질문
                        </span>
                        <i className="w-0.5 rounded-[2px] bg-border-action" aria-hidden="true" />
                        <span className="flex flex-col items-center whitespace-nowrap">
                            <b className="font-display text-[21px] leading-none font-normal text-primary">
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
                                className="pointer-events-none absolute inset-x-0 -inset-y-1.5 -z-10 mx-auto w-full max-w-[352px] rounded-full bg-[radial-gradient(closest-side,rgba(232,119,46,0.35),transparent)]"
                                animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.98, 1.04, 0.98] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                aria-hidden="true"
                            />
                        )}
                        <GameButton
                            data-testid="start-button"
                            onClick={handleStart}
                            className="w-full max-w-[340px]"
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
