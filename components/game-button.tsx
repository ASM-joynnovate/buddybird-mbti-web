'use client'

// Raised "cozy forest game" CTA button (issue #19 tracer — the full game button
// system lands in issue #20). Wraps m.button (LazyMotion convention, ADR-0006)
// so meaningful taps get the shared buttonTap press (sink + shrink) while the
// CSS :active state shrinks the bottom depth shadow in concert. Under
// prefers-reduced-motion the tap motion is dropped; the button stays usable.
import type { ReactNode } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { buttonTap } from '@/lib/motion'

interface GameButtonProps {
    children: ReactNode
    onClick?: () => void
    className?: string
    type?: 'button' | 'submit'
    'data-testid'?: string
    'aria-label'?: string
    disabled?: boolean
}

export function GameButton({
    children,
    onClick,
    className,
    type = 'button',
    disabled,
    ...rest
}: GameButtonProps) {
    const reducedMotion = useReducedMotion()

    return (
        <m.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileTap={reducedMotion ? undefined : buttonTap}
            className={['game-btn', 'game-btn--primary', className].filter(Boolean).join(' ')}
            {...rest}
        >
            {children}
        </m.button>
    )
}
