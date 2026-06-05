'use client'

// "Cozy forest game" button system (issue #20) — the single component behind
// every meaningful button in the funnel. Wraps m.button / m.a (LazyMotion
// convention, ADR-0006) so taps get the shared buttonTap press (sink + shrink)
// while the CSS :active state squashes the bottom depth shadow in concert.
// Variants map 1:1 to the .game-btn--* classes in app/globals.css; the color
// stance (primary = bell orange ONLY, lime never on actions) lives there.
// Under prefers-reduced-motion the tap motion is dropped; the button stays
// fully usable.
import type { ReactNode } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { buttonTap } from '@/lib/motion'

export type GameButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'fab'

const VARIANT_CLASS: Record<GameButtonVariant, string> = {
    primary: 'game-btn--primary',
    secondary: 'game-btn--secondary',
    ghost: 'game-btn--ghost',
    icon: 'game-btn--icon',
    fab: 'game-btn--fab',
}

function gameButtonClass(
    variant: GameButtonVariant,
    size: 'md' | 'sm',
    className: string | undefined,
): string {
    return ['game-btn', VARIANT_CLASS[variant], size === 'sm' ? 'game-btn--sm' : null, className]
        .filter(Boolean)
        .join(' ')
}

interface GameButtonBaseProps {
    children: ReactNode
    variant?: GameButtonVariant
    /** Compact pill (44px floor) — for inline/secondary placements. */
    size?: 'md' | 'sm'
    className?: string
    'data-testid'?: string
    'aria-label'?: string
}

interface GameButtonProps extends GameButtonBaseProps {
    onClick?: () => void
    type?: 'button' | 'submit'
    disabled?: boolean
}

export function GameButton({
    children,
    variant = 'primary',
    size = 'md',
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
            whileTap={reducedMotion || disabled ? undefined : buttonTap}
            className={gameButtonClass(variant, size, className)}
            {...rest}
        >
            {children}
        </m.button>
    )
}

interface GameButtonLinkProps extends GameButtonBaseProps {
    href: string
    target?: string
    rel?: string
    onClick?: () => void
}

/** Anchor flavor of the game button — external CTAs (e.g. the app install link). */
export function GameButtonLink({
    children,
    variant = 'secondary',
    size = 'md',
    href,
    target,
    rel,
    onClick,
    className,
    ...rest
}: GameButtonLinkProps) {
    const reducedMotion = useReducedMotion()

    return (
        <m.a
            href={href}
            target={target}
            rel={rel}
            onClick={onClick}
            whileTap={reducedMotion ? undefined : buttonTap}
            className={gameButtonClass(variant, size, className)}
            {...rest}
        >
            {children}
        </m.a>
    )
}
