'use client'

// Type detail modal — a per-type gradient hero (code + nickname over its identity
// gradient), catchphrase, personality blurb, and compatibility chips. Shared by the
// dex grid (tap a card) and the result match section (deep-link /dex?focus=CODE).
// Ported from the bundle TypeModal with real a11y: role="dialog" + aria-modal, Escape
// + backdrop close, initial focus on the close button, a Tab focus trap, restored
// focus on unmount, and a body scroll lock while open.
//
// Motion pass (issue #25, ADR-0006): open/close runs through AnimatePresence —
// the caller (dex-view) wraps the conditional mount, this component declares
// enter/exit variants (backdrop fade + sheetSlideUp panel; the exit leg is new,
// the old modal-fade/modal-in keyframes had none). Under prefers-reduced-motion
// both legs degrade to a quick opacity-only fade. The close button is the
// issue-20 GameButton icon variant.
import { useEffect, useRef, type CSSProperties } from 'react'
import { m, useReducedMotion, type Variants } from 'motion/react'
import { GameButton } from '@/components/game-button'
import { ParrotImage } from '@/components/parrot-image'
import { getTypeInfo, typeGradient } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { durationBase, durationFast, sheetSlideUp } from '@/lib/motion'
import { MatchChip } from './match-chip'

// Backdrop cross-fade with an explicit exit leg (paired with sheetSlideUp on
// the panel; both consumed by the AnimatePresence wrapper in dex-view).
const backdropFade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: durationBase } },
    exit: { opacity: 0, transition: { duration: durationFast } },
}

// Reduced motion: opacity-only on both layers, exit included.
const reducedFade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.12 } },
    exit: { opacity: 0, transition: { duration: 0.08 } },
}

interface TypeModalProps {
    code: TypeCode
    onClose: () => void
}

export function TypeModal({ code, onClose }: TypeModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const reducedMotion = useReducedMotion()

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null
        closeRef.current?.focus()

        const { overflow } = document.body.style
        document.body.style.overflow = 'hidden'

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
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
    }, [code, onClose])

    const info = getTypeInfo(code)
    if (info === null) {
        return null
    }

    const style = { '--type-grad': typeGradient(code) } as CSSProperties

    return (
        <m.div
            className="modal-backdrop"
            onClick={onClose}
            variants={reducedMotion ? reducedFade : backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <m.div
                ref={dialogRef}
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={`${code} ${info.name}`}
                onClick={(event) => event.stopPropagation()}
                style={style}
                data-testid={`type-modal-${code}`}
                variants={reducedMotion ? reducedFade : sheetSlideUp}
            >
                <div className="modal-hero">
                    <GameButton
                        ref={closeRef}
                        variant="icon"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="닫기"
                        data-testid="modal-close"
                    >
                        ✕
                    </GameButton>
                    <div className="modal-art">
                        <ParrotImage type={code} width={280} height={280} loading="eager" />
                    </div>
                    <p className="modal-code font-display">{code}</p>
                    <p className="modal-nick font-display">{info.name}</p>
                </div>

                <div className="modal-body">
                    <p className="modal-tag">“{info.report}”</p>
                    <p className="modal-desc">{info.description}</p>
                    <h3 className="modal-section-title">환상의 궁합</h3>
                    <div className="chips">
                        {info.match.map((matchCode) => (
                            <MatchChip key={matchCode} code={matchCode} />
                        ))}
                    </div>
                </div>
            </m.div>
        </m.div>
    )
}
