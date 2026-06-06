'use client'

// The single button source of the 동화숲 raised-block system (DESIGN.md v2).
// Every variant is a soft physical block: bottom depth bar in the pressed shade
// + forest-toned drop + inset top highlight, written as inline Tailwind
// utilities on top of the @theme shadow recipes (shadow-raise-*). The press
// motion (sink + shrink) is Motion's whileTap (lib/motion buttonTap); the CSS
// :active state only squashes the depth shadow in concert — CSS never touches
// transform, so the two can't fight.
//
// Variants (DESIGN.md components): primary (orange gradient pill, Jua 23px) ·
// secondary (cream pill, orange border + depth-action bar) · ghost (quiet
// inline text) · icon (40px round close-button chrome). Size --sm keeps the
// 44px touch floor while reading smaller. Under prefers-reduced-motion the tap
// motion is dropped; the button stays fully usable.
import type { ReactNode, Ref } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { buttonTap } from '@/lib/motion'

export type GameButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon'
export type GameButtonSize = 'md' | 'sm'

const BASE_CLASS =
    'inline-flex cursor-pointer touch-manipulation items-center justify-center gap-2.5 rounded-full font-display leading-[1.2] whitespace-nowrap transition-[box-shadow,background-color,border-color,color,filter] duration-150 ease-leaf focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-[0.4] [-webkit-tap-highlight-color:transparent]'

// Full class string per variant×size (prettier-plugin-tailwindcss compatible —
// no conditional fragments). Disabled flattens via the base class above.
const VARIANT_CLASS: Record<GameButtonVariant, Record<GameButtonSize, string>> = {
    primary: {
        md: 'min-h-[58px] bg-[linear-gradient(180deg,#eb8a4b,var(--color-primary))] px-10 py-4 text-[23px] text-on-primary shadow-raise-primary hover:brightness-[1.04] hover:saturate-[1.06] active:shadow-raise-primary-down disabled:hover:brightness-100 disabled:hover:saturate-[0.4]',
        sm: 'min-h-[50px] bg-[linear-gradient(180deg,#eb8a4b,var(--color-primary))] px-6 py-3 text-[19px] text-on-primary shadow-raise-primary hover:brightness-[1.04] hover:saturate-[1.06] active:shadow-raise-primary-down disabled:hover:brightness-100 disabled:hover:saturate-[0.4]',
    },
    secondary: {
        md: 'min-h-[46px] border-2 border-border-action bg-surface-cream px-[22px] py-[11px] text-[15px] text-primary-active shadow-raise-cream hover:border-primary hover:bg-[#fffcf0] active:shadow-raise-cream-down',
        sm: 'min-h-[44px] border-2 border-border-action bg-surface-cream px-4 py-2.5 text-[15px] text-primary-active shadow-raise-cream hover:border-primary hover:bg-[#fffcf0] active:shadow-raise-cream-down',
    },
    ghost: {
        md: 'min-h-[44px] px-4 py-2.5 text-[15px] text-ink-muted hover:bg-surface-cream hover:text-ink',
        sm: 'min-h-[44px] px-3 py-2 text-[14px] text-ink-muted hover:bg-surface-cream hover:text-ink',
    },
    // icon md = 44px round (quiz back — keeps the touch floor); icon sm = 40px
    // round (the DESIGN.md close-button inside modals/overlays).
    icon: {
        md: 'size-11 border-2 border-border-action bg-surface-cream p-0 text-xl text-primary-active shadow-raise-cream-sm hover:border-primary hover:bg-[#fffcf0] active:shadow-[0_1px_0_var(--color-depth-action)]',
        sm: 'size-10 border-2 border-border-action bg-surface-cream p-0 text-[15px] text-primary-active shadow-raise-cream-sm hover:border-primary hover:bg-[#fffcf0] active:shadow-[0_1px_0_var(--color-depth-action)]',
    },
}

function gameButtonClass(
    variant: GameButtonVariant,
    size: GameButtonSize,
    className: string | undefined,
): string {
    return [BASE_CLASS, VARIANT_CLASS[variant][size], className].filter(Boolean).join(' ')
}

interface GameButtonBaseProps {
    children: ReactNode
    variant?: GameButtonVariant
    /** Compact pill (44px floor) — for inline/secondary placements. */
    size?: GameButtonSize
    className?: string
    'data-testid'?: string
    'aria-label'?: string
}

interface GameButtonProps extends GameButtonBaseProps {
    onClick?: () => void
    type?: 'button' | 'submit'
    disabled?: boolean
    /** React 19 ref-as-prop — callers needing imperative focus (e.g. modal initial focus). */
    ref?: Ref<HTMLButtonElement>
}

export function GameButton({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    className,
    type = 'button',
    disabled,
    ref,
    ...rest
}: GameButtonProps) {
    const reducedMotion = useReducedMotion()

    return (
        <m.button
            ref={ref}
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
