'use client'

// Type detail popup — the trading-card-style modal of the deck system (replaces
// the old TypeModal): per-type gradient portrait band with the giant code, cream
// scrollable body with name / dashed rule / full description, a "찰떡궁합" match
// panel whose chips swap the popup to that type, and an optional primary CTA.
// Shown over a blurred forest scrim from the landing deck and the result screen.
//
// A11y (ported from TypeModal): role="dialog" + aria-modal, Escape + scrim
// close, initial focus on the close button, a Tab focus trap, restored focus on
// unmount, and a body scroll lock while open. Open/close motion is
// AnimatePresence-owned — the CALLER wraps the conditional mount; this
// component declares enter/exit variants (scrim fade + card pop-in). Under
// prefers-reduced-motion both legs degrade to a quick opacity-only fade.
import { useEffect, useEffectEvent, useRef } from 'react'
import { m, useReducedMotion, type Variants } from 'motion/react'
import { DashedRule } from '@/components/ui/dashed-rule'
import { GameButton } from '@/components/ui/game-button'
import { PortraitWindow } from '@/components/ui/portrait-window'
import { getTypeInfo } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { durationBase, durationFast, easeSpring } from '@/lib/motion'

const scrimFade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: durationBase } },
    exit: { opacity: 0, transition: { duration: durationFast } },
}

// Springy card pop (the bundle's popIn keyframe, Motion-owned with an exit leg).
const cardPop: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.36, ease: easeSpring } },
    exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: durationFast } },
}

// Reduced motion: opacity-only on both layers, exit included.
const reducedFade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.12 } },
    exit: { opacity: 0, transition: { duration: 0.08 } },
}

interface DetailPopupProps {
    code: TypeCode
    onClose: () => void
    /** Match-chip tap → swap the popup to that type (caller updates its state). */
    onSelectType?: (code: TypeCode) => void
    /** Optional primary CTA at the body's end (e.g. "이 친구 홈에서 보기"). */
    cta?: { label: string; onClick: () => void }
}

export function DetailPopup({ code, onClose, onSelectType, cta }: DetailPopupProps) {
    const dialogRef = useRef<HTMLDivElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const reducedMotion = useReducedMotion()

    // Effect Event: the keydown handler always sees the latest onClose without
    // making it a dep — otherwise every parent re-render (new arrow identity)
    // re-ran the dialog setup, re-stealing focus to the close button.
    const handleClose = useEffectEvent(onClose)

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null
        closeRef.current?.focus()

        const { overflow } = document.body.style
        document.body.style.overflow = 'hidden'

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose()
                return
            }
            if (event.key !== 'Tab') {
                return
            }
            // Trap focus within the dialog.
            const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            )
            if (focusables === undefined || focusables.length === 0) {
                return
            }
            const first = focusables[0]
            const last = focusables[focusables.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = overflow
            previouslyFocused?.focus()
        }
        // `code` stays a dep on purpose: swapping types via a match chip re-runs
        // the setup so initial focus lands back on the close button.
    }, [code])

    const info = getTypeInfo(code)
    if (info === null) {
        return null
    }

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-gutter">
            {/* Scrim — translucent by necessity (it dims arbitrary content below). */}
            <m.div
                className="absolute inset-0 bg-[rgba(24,38,24,0.55)] backdrop-blur-[3px]"
                onClick={onClose}
                variants={reducedMotion ? reducedFade : scrimFade}
                initial="hidden"
                animate="visible"
                exit="exit"
                data-testid="detail-scrim"
            />

            <m.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={`${code} ${info.name}`}
                data-testid={`detail-popup-${code}`}
                className="relative z-1 flex max-h-[calc(100dvh-2.75rem)] w-full max-w-md flex-col rounded-card bg-(image:--gradient-card-frame) p-1.5 shadow-[0_8px_0_var(--color-primary-active),0_26px_50px_-16px_rgba(20,12,6,0.7),inset_0_2px_0_rgba(255,255,255,0.5)]"
                variants={reducedMotion ? reducedFade : cardPop}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <GameButton
                    ref={closeRef}
                    variant="icon"
                    size="sm"
                    className="absolute top-3.5 right-3.5 z-4"
                    onClick={onClose}
                    aria-label="닫기"
                    data-testid="detail-close"
                >
                    ✕
                </GameButton>

                <PortraitWindow
                    code={code}
                    imgSize={190}
                    variant="hero"
                    className="h-50 flex-none rounded-t-lg"
                >
                    <span
                        className="absolute bottom-3 left-4 z-3 font-display text-[2.75rem] leading-[0.9] tracking-wider text-white [text-shadow:0_3px_10px_rgba(0,0,0,0.45)]"
                        aria-hidden="true"
                    >
                        {code}
                    </span>
                </PortraitWindow>

                <div className="min-h-0 flex-1 overflow-y-auto rounded-b-lg border-[1.5px] border-t-0 border-white bg-surface-cream px-4 pt-4 pb-4 [-webkit-overflow-scrolling:touch]">
                    <p className="m-0 font-display text-xl text-primary-active">{info.name}</p>
                    <DashedRule className="my-3" />
                    <p className="m-0 mb-4 text-sm leading-relaxed break-keep text-ink">
                        {info.description}
                    </p>

                    {info.match.length > 0 && (
                        <div className="mb-4 flex items-center gap-3 rounded-md border-2 border-border-action bg-white px-3.5 py-3 shadow-[0_3px_0_var(--color-depth-action),inset_0_2px_0_rgba(255,255,255,0.9)]">
                            <span className="flex-none font-display text-sm whitespace-nowrap text-primary-active">
                                찰떡궁합
                            </span>
                            <div className="ml-auto flex gap-2">
                                {info.match.map((matchCode) =>
                                    onSelectType !== undefined ? (
                                        <button
                                            key={matchCode}
                                            type="button"
                                            className="inline-flex cursor-pointer items-center rounded-full bg-(image:--gradient-cta) px-3.5 py-1 font-display text-sm tracking-wider text-on-primary shadow-raise-bar-primary active:shadow-[0_1px_0_var(--color-primary-active)]"
                                            onClick={() => onSelectType(matchCode)}
                                            data-testid={`detail-match-${matchCode}`}
                                        >
                                            {matchCode}
                                        </button>
                                    ) : (
                                        <span
                                            key={matchCode}
                                            className="inline-flex items-center rounded-full bg-(image:--gradient-cta) px-3.5 py-1 font-display text-sm tracking-wider text-on-primary shadow-raise-bar-primary"
                                        >
                                            {matchCode}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                    {cta !== undefined && (
                        <GameButton
                            variant="primary"
                            size="sm"
                            className="w-full"
                            onClick={cta.onClick}
                            data-testid="detail-cta"
                        >
                            {cta.label}
                        </GameButton>
                    )}
                </div>
            </m.div>
        </div>
    )
}
