'use client'

// "백 스택" hero showcase (replaces TypeShowcase): the active trading card fills
// the container width with the next two types peeking behind as ghost
// card-backs. The stack auto-advances (ADR-0005 pattern: the setInterval is
// STATE orchestration, the visible swap is a keyed m.div entrance), tapping the
// active card opens its detail popup, and scrubbing the stack (wheel / touch
// drag, via controller.bindScrub) opens the full deck overlay — the same shared
// `progress` MotionValue fades/lifts this stack away as the deck rises.
import { useEffect, useRef, useState, type RefObject } from 'react'
import { m, useReducedMotion, useTransform } from 'motion/react'
import { getTypeInfo } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { easeSpring } from '@/shared/motion'
import { CardGhost } from '@/shared/ui/card-ghost'
import { TradingCard } from '@/shared/ui/trading-card'
import type { DeckController } from './deck-overlay'

export interface BackStackControls {
    /** Jump the stack to a type (detail popup "이 친구 홈에서 보기"). */
    setActive: (code: TypeCode) => void
}

interface BackStackProps {
    pool: readonly TypeCode[]
    intervalMs?: number
    controller: DeckController
    /** Tap on the active card → open its detail popup (owned by the caller). */
    onCardTap: (code: TypeCode) => void
    /** Pause auto-advance (e.g. while a detail popup is open). */
    paused?: boolean
    controlsRef?: RefObject<BackStackControls | null>
}

export function BackStack({
    pool,
    intervalMs = 3000,
    controller,
    onCardTap,
    paused = false,
    controlsRef,
}: BackStackProps) {
    const reduced = useReducedMotion()
    const [pos, setPos] = useState(0)
    const [hovered, setHovered] = useState(false)
    const hostRef = useRef<HTMLDivElement>(null)

    const len = pool.length
    const idx = ((pos % len) + len) % len
    const active = pool[idx] as TypeCode
    const next1 = pool[(idx + 1) % len] as TypeCode
    const next2 = pool[(idx + 2) % len] as TypeCode
    const info = getTypeInfo(active)

    const { progress } = controller

    // Auto-advance — skipped under reduced motion, while hovered/focused, while a
    // popup is open, and while the deck is engaged (scrubbing or open; checked at
    // tick time so a scrub never has to tear the interval down).
    useEffect(() => {
        if (reduced || hovered || paused || controller.isOpen || len <= 1) {
            return
        }
        const timer = setInterval(() => {
            if (progress.get() > 0.001) {
                return
            }
            setPos((prev) => prev + 1)
        }, intervalMs)
        return () => clearInterval(timer)
    }, [reduced, hovered, paused, controller.isOpen, len, intervalMs, progress])

    // Imperative jump for the detail popup CTA.
    useEffect(() => {
        if (controlsRef === undefined) {
            return
        }
        controlsRef.current = {
            setActive: (code) => {
                const target = pool.indexOf(code)
                if (target >= 0) {
                    setPos(target)
                }
            },
        }
        return () => {
            controlsRef.current = null
        }
    }, [controlsRef, pool])

    // Opening scrub listeners live on this host (wheel + touch drag).
    useEffect(() => {
        return controller.bindScrub(hostRef.current)
    }, [controller])

    // The whole stack fades/lifts away as the deck overlay rises.
    const stackOpacity = useTransform(progress, (p) => 1 - Math.min(1, p * 1.25))
    const stackY = useTransform(progress, (p) => -p * 60)
    const stackScale = useTransform(progress, (p) => 1 - p * 0.06)
    const stackPointer = useTransform(progress, (p) => (p > 0.05 ? 'none' : 'auto'))
    const hintOpacity = useTransform(progress, (p) => 1 - Math.min(1, p * 3))

    if (info === null) {
        return null
    }

    return (
        <section
            className="flex w-full flex-col items-center"
            data-testid="back-stack"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocusCapture={() => setHovered(true)}
            onBlurCapture={() => setHovered(false)}
        >
            {/* Cap the hero card width so it never dominates the viewport (the
                gutter still governs on narrower screens). Standard Tailwind
                step: md = 28rem. */}
            <div ref={hostRef} className="w-full max-w-md [touch-action:none]">
                <m.div
                    className="relative w-full pb-6"
                    style={{
                        opacity: stackOpacity,
                        y: stackY,
                        scale: stackScale,
                        pointerEvents: stackPointer,
                    }}
                >
                    <CardGhost code={next2} className="z-1 translate-y-6.5 scale-x-90 opacity-90" />
                    <CardGhost code={next1} className="z-2 translate-y-3.5 scale-x-95" />

                    {/* Keyed swap entrance — each advance remounts the active card. */}
                    <m.div
                        key={active}
                        className="relative z-3"
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
                        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        transition={
                            reduced ? { duration: 0.12 } : { duration: 0.46, ease: easeSpring }
                        }
                    >
                        <button
                            type="button"
                            className="block w-full cursor-pointer p-0 text-left"
                            onClick={() => onCardTap(active)}
                            aria-label={`${active} ${info.name} 자세히 보기`}
                            data-testid="stack-active-card"
                            data-code={active}
                        >
                            {/* default-lazy on purpose: eager would promote the
                                parrot art to a head preload that competes with
                                the LCP canopy; lazy-but-in-viewport still loads
                                in the first wave after layout. */}
                            <TradingCard code={active} loading="lazy" />
                        </button>
                    </m.div>
                </m.div>

                {/* Scrub hint — fades out the moment the deck starts rising. */}
                <m.div
                    className="pointer-events-none mt-3 flex flex-col items-center gap-0.5 text-xs font-bold text-primary-active"
                    style={{ opacity: hintOpacity }}
                    aria-hidden="true"
                >
                    <span>스크롤해서 전체 보기</span>
                    {reduced ? (
                        <i className="text-lg leading-[0.6] not-italic">⌄</i>
                    ) : (
                        <m.i
                            className="text-lg leading-[0.6] not-italic"
                            animate={{ y: [0, 4, 0], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            ⌄
                        </m.i>
                    )}
                </m.div>
            </div>

            {/* SR announcement of the active type (replaces the visual caption). */}
            <p className="sr-only" aria-live="polite" data-testid="stack-caption">
                {active} {info.name}
            </p>
        </section>
    )
}
