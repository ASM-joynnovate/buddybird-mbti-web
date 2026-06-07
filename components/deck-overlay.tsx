'use client'

// Full-screen deck overlay — the 16-type collection that scrubs open over the
// landing hero (replaces the /dex route, ADR-0007). One MotionValue `progress`
// (0..1) drives every layer: the BackStack fades/lifts away, the overlay
// backdrop fades in, and each compact trading card rises with a per-index
// stagger (clamp(p*2.1 - i*0.045, 0, 1)). Input paths:
//
//   - wheel / touch-drag scrub on the BackStack host (bindScrub) — releasing
//     past OPEN_THRESHOLD snaps open, under it snaps shut
//   - the "16유형 모두 보기" button → openAnimated() (deterministic, e2e path)
//   - reduced motion: every snap is an instant progress jump
//
// Snaps run through the standalone animate() — safe alongside LazyMotion
// strict, which only guards m.* components. The overlay portals into
// document.body (fixed inset-0) so it never affects the hero layout; while not
// fully open it is inert (no tab stops, no clicks).
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    animate,
    m,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useTransform,
    type AnimationPlaybackControls,
    type MotionValue,
} from 'motion/react'
import { createPortal } from 'react-dom'
import { GameButton } from '@/components/ui/game-button'
import { GamePill } from '@/components/ui/game-pill'
import { TradingCard } from '@/components/ui/trading-card'
import { CAROUSEL_TYPES, getTypeInfo } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { easeLeaf } from '@/lib/motion'

const OPEN_THRESHOLD = 0.34
const WHEEL_GAIN = 0.0016
const TOUCH_GAIN = 0.0042

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export interface DeckController {
    /** 0..1 scrub/open progress — shared by the overlay and the BackStack. */
    progress: MotionValue<number>
    /** Fully open: native scroll + focusable cards + close gesture. */
    isOpen: boolean
    /** Overlay should be mounted (progress > 0 or open). */
    isEngaged: boolean
    /** Attach wheel/touch scrub listeners to the stack host. Returns cleanup. */
    bindScrub: (el: HTMLElement | null) => (() => void) | undefined
    openAnimated: () => void
    close: () => void
}

export function useDeckController(): DeckController {
    const progress = useMotionValue(0)
    const reduced = useReducedMotion()
    const [isOpen, setIsOpen] = useState(false)
    const [isEngaged, setIsEngaged] = useState(false)

    const isOpenRef = useRef(false)
    const animRef = useRef<AnimationPlaybackControls | null>(null)
    const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const touchY = useRef<number | null>(null)

    useMotionValueEvent(progress, 'change', (v) => {
        setIsEngaged(v > 0.001 || isOpenRef.current)
    })

    const stopSnap = useCallback(() => {
        animRef.current?.stop()
        animRef.current = null
    }, [])

    const setOpen = useCallback((open: boolean) => {
        isOpenRef.current = open
        setIsOpen(open)
        if (open) {
            setIsEngaged(true)
        }
    }, [])

    const reallyOpen = useCallback(() => {
        if (endTimer.current !== null) {
            clearTimeout(endTimer.current)
        }
        stopSnap()
        setOpen(true)
        if (reduced) {
            progress.set(1)
            return
        }
        animRef.current = animate(progress, 1, { duration: 0.28, ease: easeLeaf })
    }, [progress, reduced, setOpen, stopSnap])

    const openAnimated = useCallback(() => {
        if (endTimer.current !== null) {
            clearTimeout(endTimer.current)
        }
        stopSnap()
        setOpen(true)
        if (reduced) {
            progress.set(1)
            return
        }
        animRef.current = animate(progress, 1, { duration: 0.46, ease: easeLeaf })
    }, [progress, reduced, setOpen, stopSnap])

    const close = useCallback(() => {
        if (endTimer.current !== null) {
            clearTimeout(endTimer.current)
        }
        stopSnap()
        setOpen(false)
        if (reduced) {
            progress.set(0)
            setIsEngaged(false)
            return
        }
        animRef.current = animate(progress, 0, { duration: 0.3, ease: easeLeaf })
    }, [progress, reduced, setOpen, stopSnap])

    // Scrub release: past the threshold the deck commits open, under it snaps shut.
    const snapEnd = useCallback(() => {
        if (progress.get() >= OPEN_THRESHOLD) {
            reallyOpen()
            return
        }
        if (reduced) {
            progress.set(0)
            return
        }
        animRef.current = animate(progress, 0, { duration: 0.26, ease: easeLeaf })
    }, [progress, reduced, reallyOpen])

    const bindScrub = useCallback(
        (el: HTMLElement | null) => {
            if (el === null) {
                return undefined
            }

            const onWheel = (event: WheelEvent) => {
                if (isOpenRef.current) {
                    return
                }
                event.preventDefault()
                stopSnap()
                progress.set(clamp(progress.get() + event.deltaY * WHEEL_GAIN, 0, 1))
                if (endTimer.current !== null) {
                    clearTimeout(endTimer.current)
                }
                endTimer.current = setTimeout(snapEnd, 150)
                if (progress.get() >= 1) {
                    reallyOpen()
                }
            }

            const onTouchStart = (event: TouchEvent) => {
                if (!isOpenRef.current) {
                    touchY.current = event.touches[0]?.clientY ?? null
                }
            }
            const onTouchMove = (event: TouchEvent) => {
                if (isOpenRef.current || touchY.current === null) {
                    return
                }
                const cur = event.touches[0]?.clientY ?? touchY.current
                const dy = touchY.current - cur
                event.preventDefault()
                stopSnap()
                progress.set(clamp(progress.get() + dy * TOUCH_GAIN, 0, 1))
                touchY.current = cur
                if (progress.get() >= 1) {
                    reallyOpen()
                    touchY.current = null
                }
            }
            const onTouchEnd = () => {
                if (!isOpenRef.current && touchY.current !== null) {
                    snapEnd()
                }
                touchY.current = null
            }

            el.addEventListener('wheel', onWheel, { passive: false })
            el.addEventListener('touchstart', onTouchStart, { passive: true })
            el.addEventListener('touchmove', onTouchMove, { passive: false })
            el.addEventListener('touchend', onTouchEnd)
            return () => {
                el.removeEventListener('wheel', onWheel)
                el.removeEventListener('touchstart', onTouchStart)
                el.removeEventListener('touchmove', onTouchMove)
                el.removeEventListener('touchend', onTouchEnd)
            }
        },
        [progress, reallyOpen, snapEnd, stopSnap],
    )

    // Clear the pending snap timer on unmount.
    useEffect(() => {
        return () => {
            if (endTimer.current !== null) {
                clearTimeout(endTimer.current)
            }
            stopSnap()
        }
    }, [stopSnap])

    return { progress, isOpen, isEngaged, bindScrub, openAnimated, close }
}

// One compact deck card, lifted by its own slice of the shared progress.
function DeckCard({
    code,
    index,
    progress,
    isOpen,
    onSelect,
}: {
    code: TypeCode
    index: number
    progress: MotionValue<number>
    isOpen: boolean
    onSelect: (code: TypeCode) => void
}) {
    const lift = useTransform(progress, (p) => clamp(p * 2.1 - index * 0.045, 0, 1))
    const y = useTransform(lift, (l) => (1 - l) * 96)
    const scale = useTransform(lift, (l) => 0.82 + 0.18 * l)
    const info = getTypeInfo(code)

    return (
        <m.button
            type="button"
            className="block w-full origin-bottom cursor-pointer p-0"
            style={{ opacity: lift, y, scale }}
            onClick={() => onSelect(code)}
            tabIndex={isOpen ? 0 : -1}
            aria-label={`${code} ${info?.name ?? ''}`.trim()}
            data-testid={`deck-card-${code}`}
        >
            <TradingCard code={code} compact loading="lazy" />
        </m.button>
    )
}

interface DeckOverlayProps {
    controller: DeckController
    /** Tap a deck card → open its detail popup (owned by the caller). */
    onSelect: (code: TypeCode) => void
}

export function DeckOverlay({ controller, onSelect }: DeckOverlayProps) {
    const { progress, isOpen, isEngaged, close } = controller
    const scrollRef = useRef<HTMLDivElement>(null)
    const touchY = useRef<number | null>(null)

    const overlayOpacity = useTransform(progress, (p) => Math.min(1, p * 1.3))
    const headOpacity = useTransform(progress, (p) => clamp((p - 0.18) / 0.5, 0, 1))

    // Closing gesture — wheel/touch pull UP at the very top of the open list.
    useEffect(() => {
        const el = scrollRef.current
        if (el === null || !isOpen) {
            return
        }
        const onWheel = (event: WheelEvent) => {
            if (event.deltaY < 0 && el.scrollTop <= 0) {
                event.preventDefault()
                close()
            }
        }
        const onTouchStart = (event: TouchEvent) => {
            touchY.current = event.touches[0]?.clientY ?? null
        }
        const onTouchMove = (event: TouchEvent) => {
            if (touchY.current === null) {
                touchY.current = event.touches[0]?.clientY ?? null
                return
            }
            const dy = touchY.current - (event.touches[0]?.clientY ?? touchY.current)
            if (dy < -6 && el.scrollTop <= 0) {
                event.preventDefault()
                close()
                touchY.current = null
            }
        }
        const onTouchEnd = () => {
            touchY.current = null
        }
        el.addEventListener('wheel', onWheel, { passive: false })
        el.addEventListener('touchstart', onTouchStart, { passive: true })
        el.addEventListener('touchmove', onTouchMove, { passive: false })
        el.addEventListener('touchend', onTouchEnd)
        return () => {
            el.removeEventListener('wheel', onWheel)
            el.removeEventListener('touchstart', onTouchStart)
            el.removeEventListener('touchmove', onTouchMove)
            el.removeEventListener('touchend', onTouchEnd)
        }
    }, [isOpen, close])

    // isEngaged only ever turns true after user interaction, so document is
    // always available here (no SSR/hydration guard needed).
    if (!isEngaged) {
        return null
    }

    return createPortal(
        <m.div
            className="fixed inset-0 z-40 flex flex-col bg-[radial-gradient(120%_80%_at_50%_-10%,#fff8e3,#fbf3df_60%)]"
            style={{ opacity: overlayOpacity, pointerEvents: isOpen ? 'auto' : 'none' }}
            aria-hidden={!isOpen}
            inert={!isOpen}
            data-testid="deck-overlay"
            data-open={isOpen ? 'true' : 'false'}
        >
            <m.div
                className="flex flex-none items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-3"
                style={{ opacity: headOpacity }}
            >
                <GamePill bare className="px-4 py-2 font-display text-xl text-ink">
                    전체 유형&nbsp;<b className="font-normal text-primary">16</b>
                </GamePill>
                <GameButton
                    variant="icon"
                    size="sm"
                    onClick={close}
                    aria-label="닫기"
                    data-testid="deck-close"
                >
                    ✕
                </GameButton>
            </m.div>

            <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-x-hidden overscroll-contain px-4 pt-1 pb-7 [-webkit-overflow-scrolling:touch]"
                style={{ overflowY: isOpen ? 'auto' : 'hidden' }}
            >
                <div className="grid grid-cols-2 gap-4">
                    {CAROUSEL_TYPES.map((code, index) => (
                        <DeckCard
                            key={code}
                            code={code}
                            index={index}
                            progress={progress}
                            isOpen={isOpen}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            </div>
        </m.div>,
        document.body,
    )
}
