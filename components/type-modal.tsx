'use client'

// Type detail modal — a per-type gradient hero (code + nickname over its identity
// gradient), catchphrase, personality blurb, and compatibility chips. Shared by the
// dex grid (tap a card) and the result match section (deep-link /dex?focus=CODE).
// Ported from the bundle TypeModal with real a11y: role="dialog" + aria-modal, Escape
// + backdrop close, initial focus on the close button, a Tab focus trap, restored
// focus on unmount, and a body scroll lock while open.
import { useEffect, useRef, type CSSProperties } from 'react'
import { ParrotImage } from '@/components/parrot-image'
import { getTypeInfo, typeGradient } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { MatchChip } from './match-chip'

interface TypeModalProps {
    code: TypeCode
    onClose: () => void
}

export function TypeModal({ code, onClose }: TypeModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)

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
        <div className="modal-backdrop" onClick={onClose}>
            <div
                ref={dialogRef}
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={`${code} ${info.name}`}
                onClick={(event) => event.stopPropagation()}
                style={style}
                data-testid={`type-modal-${code}`}
            >
                <div className="modal-hero">
                    <button
                        ref={closeRef}
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="닫기"
                        data-testid="modal-close"
                    >
                        ✕
                    </button>
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
            </div>
        </div>
    )
}
