'use client';

// The single button source of the 동화숲 raised-block system (DESIGN.md v2).
// Every variant is a soft physical block: bottom depth bar in the pressed shade
// + forest-toned drop + inset top highlight, written as inline Tailwind
// utilities on top of the @theme shadow recipes (shadow-raise-*). The press
// motion (sink + shrink) is Motion's whileTap (lib/motion buttonTap); the CSS
// :active state only squashes the depth shadow in concert — CSS never touches
// transform, so the two can't fight.
//
// Variants (DESIGN.md components): primary (orange gradient pill, Jua 2xl) ·
// secondary (cream pill, orange border + depth-action bar) · ghost (quiet
// inline text) · icon (40px round close-button chrome). Size --sm keeps the
// 44px touch floor while reading smaller. Under prefers-reduced-motion the tap
// motion is dropped; the button stays fully usable.
import type { ReactNode, Ref } from 'react';

import { buttonTap } from '@/shared/motion';
import { m, useReducedMotion } from 'motion/react';

export type GameButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
export type GameButtonSize = 'md' | 'sm';

const BASE_CLASS =
	'inline-flex cursor-pointer touch-manipulation items-center justify-center gap-2.5 rounded-full font-display leading-[1.2] whitespace-nowrap transition-[box-shadow,background-color,border-color,color,filter] duration-150 ease-leaf focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-[0.4] [-webkit-tap-highlight-color:transparent]';

// The orange CTA overrides the base opacity dim with a dedicated disabled "off"
// state: drop the gradient for a SOLID cream block (inset border ring + depth
// bar, muted ink) so an unavailable primary reads as a real, legible locked
// button — not the washed-out faded-orange the plain dim gives. Zero layout
// shift (ring is a box-shadow, not a border). Quieter variants keep the base
// dim, which suits their busy/loading uses.
const DISABLED_PRIMARY =
	'disabled:bg-none disabled:bg-surface-cream disabled:text-ink-muted disabled:opacity-100 disabled:saturate-100 disabled:shadow-[inset_0_0_0_2px_var(--color-border-action),0_3px_0_var(--color-depth-action)] disabled:hover:brightness-100';

// Full class string per variant×size (prettier-plugin-tailwindcss compatible —
// no conditional fragments). Disabled dim flattens via the base class; primary
// swaps in DISABLED_PRIMARY.
const VARIANT_CLASS: Record<GameButtonVariant, Record<GameButtonSize, string>> = {
	primary: {
		md: `min-h-14 bg-(image:--gradient-cta) px-10 py-4 text-2xl text-on-primary shadow-raise-primary hover:brightness-[1.04] hover:saturate-[1.06] active:shadow-raise-primary-down ${DISABLED_PRIMARY}`,
		sm: `min-h-12 bg-(image:--gradient-cta) px-6 py-3 text-lg text-on-primary shadow-raise-primary hover:brightness-[1.04] hover:saturate-[1.06] active:shadow-raise-primary-down ${DISABLED_PRIMARY}`,
	},
	secondary: {
		md: 'min-h-11 border-2 border-border-action bg-surface-cream px-5 py-3 text-base text-primary-active shadow-raise-cream hover:border-primary hover:bg-cream-hover active:shadow-raise-cream-down',
		sm: 'min-h-11 border-2 border-border-action bg-surface-cream px-4 py-2.5 text-base text-primary-active shadow-raise-cream hover:border-primary hover:bg-cream-hover active:shadow-raise-cream-down',
	},
	ghost: {
		md: 'min-h-11 px-4 py-2.5 text-base text-ink-muted hover:bg-surface-cream hover:text-ink',
		sm: 'min-h-11 px-3 py-2 text-sm text-ink-muted hover:bg-surface-cream hover:text-ink',
	},
	// icon md = 44px round (quiz back — keeps the touch floor); icon sm = 40px
	// round (the DESIGN.md close-button inside modals/overlays).
	icon: {
		md: 'size-11 border-2 border-border-action bg-surface-cream p-0 text-xl text-primary-active shadow-raise-cream-sm hover:border-primary hover:bg-cream-hover active:shadow-raise-bar-action-sm',
		sm: 'size-10 border-2 border-border-action bg-surface-cream p-0 text-base text-primary-active shadow-raise-cream-sm hover:border-primary hover:bg-cream-hover active:shadow-raise-bar-action-sm',
	},
};

function gameButtonClass(variant: GameButtonVariant, size: GameButtonSize, className: string | undefined): string {
	return [BASE_CLASS, VARIANT_CLASS[variant][size], className].filter(Boolean).join(' ');
}

interface GameButtonBaseProps {
	children: ReactNode;
	variant?: GameButtonVariant;
	/** Compact pill (44px floor) — for inline/secondary placements. */
	size?: GameButtonSize;
	className?: string;
	'data-testid'?: string;
	'aria-label'?: string;
}

interface GameButtonProps extends GameButtonBaseProps {
	onClick?: () => void;
	type?: 'button' | 'submit';
	disabled?: boolean;
	/** React 19 ref-as-prop — callers needing imperative focus (e.g. modal initial focus). */
	ref?: Ref<HTMLButtonElement>;
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
	const reducedMotion = useReducedMotion();

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
	);
}

interface GameButtonLinkProps extends GameButtonBaseProps {
	href: string;
	target?: string;
	rel?: string;
	onClick?: () => void;
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
	const reducedMotion = useReducedMotion();

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
	);
}
