'use client'

// Deck progress engine — one MotionValue `progress` (0..1) drives every layer
// of the deck system (replaces the /dex route, ADR-0007): the BackStack
// fades/lifts away, the overlay backdrop fades in, and each compact trading
// card rises with a per-index stagger. Input paths:
//
//   - wheel / touch-drag scrub on the BackStack host (bindScrub) — releasing
//     past OPEN_THRESHOLD snaps open, under it snaps shut
//   - the "16유형 모두 보기" button → openAnimated() (deterministic, e2e path)
//   - reduced motion: every snap is an instant progress jump
//
// Snaps run through the standalone animate() — safe alongside LazyMotion
// strict, which only guards m.* components.
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    animate,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    type AnimationPlaybackControls,
    type MotionValue,
} from 'motion/react'
import { easeLeaf } from '@/shared/motion'

const OPEN_THRESHOLD = 0.34
const WHEEL_GAIN = 0.0016
const TOUCH_GAIN = 0.0042

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

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

    // Clear the pending scrub-release timer. Reads the ref at call time, so
    // callers (including the unmount cleanup) always cancel the latest timer
    // without touching `endTimer.current` inside an effect cleanup directly.
    const clearEndTimer = useCallback(() => {
        if (endTimer.current !== null) {
            clearTimeout(endTimer.current)
            endTimer.current = null
        }
    }, [])

    const setOpen = useCallback((open: boolean) => {
        isOpenRef.current = open
        setIsOpen(open)
        if (open) {
            setIsEngaged(true)
        }
    }, [])

    const reallyOpen = useCallback(() => {
        clearEndTimer()
        stopSnap()
        setOpen(true)
        if (reduced) {
            progress.set(1)
            return
        }
        animRef.current = animate(progress, 1, { duration: 0.28, ease: easeLeaf })
    }, [clearEndTimer, progress, reduced, setOpen, stopSnap])

    const openAnimated = useCallback(() => {
        clearEndTimer()
        stopSnap()
        setOpen(true)
        if (reduced) {
            progress.set(1)
            return
        }
        animRef.current = animate(progress, 1, { duration: 0.46, ease: easeLeaf })
    }, [clearEndTimer, progress, reduced, setOpen, stopSnap])

    const close = useCallback(() => {
        clearEndTimer()
        stopSnap()
        setOpen(false)
        if (reduced) {
            progress.set(0)
            setIsEngaged(false)
            return
        }
        animRef.current = animate(progress, 0, { duration: 0.3, ease: easeLeaf })
    }, [clearEndTimer, progress, reduced, setOpen, stopSnap])

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
                clearEndTimer()
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
            el.addEventListener('touchend', onTouchEnd, { passive: true })
            return () => {
                el.removeEventListener('wheel', onWheel)
                el.removeEventListener('touchstart', onTouchStart)
                el.removeEventListener('touchmove', onTouchMove)
                el.removeEventListener('touchend', onTouchEnd)
            }
        },
        [clearEndTimer, progress, reallyOpen, snapEnd, stopSnap],
    )

    // Clear the pending snap timer on unmount.
    useEffect(() => {
        return () => {
            clearEndTimer()
            stopSnap()
        }
    }, [clearEndTimer, stopSnap])

    return { progress, isOpen, isEngaged, bindScrub, openAnimated, close }
}
