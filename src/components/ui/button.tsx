'use client';

import { buttonTap } from '@/lib/motion/variants';
import { cn } from '@/lib/utils';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { type VariantProps, cva } from 'class-variance-authority';
import { type HTMLMotionProps, m, useReducedMotion } from 'motion/react';

const disabledPrimary =
	'disabled:bg-none disabled:bg-surface-cream disabled:text-ink-muted disabled:opacity-100 disabled:saturate-100 disabled:shadow-[inset_0_0_0_2px_var(--color-border-action),0_3px_0_var(--color-depth-action)] disabled:hover:brightness-100';

const buttonVariants = cva(
	`inline-flex cursor-pointer touch-manipulation items-center justify-center gap-2.5 rounded-full font-display
	leading-[1.2] whitespace-nowrap transition-[box-shadow,background-color,border-color,color,filter] duration-150
	ease-leaf [-webkit-tap-highlight-color:transparent] focus-visible:outline-3 focus-visible:outline-offset-3
	focus-visible:outline-faction-sentinel disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-[0.4]`,
	{
		variants: {
			variant: {
				primary: `bg-(image:--gradient-cta) text-on-primary shadow-raise-primary hover:brightness-[1.04]
				hover:saturate-[1.06] active:shadow-raise-primary-down ${disabledPrimary}`,
				secondary: `border-2 border-border-action bg-surface-cream text-primary-active shadow-raise-cream
				hover:border-primary hover:bg-cream-hover active:shadow-raise-cream-down`,
				ghost: 'text-ink-muted hover:bg-surface-cream hover:text-ink',
				icon: `border-2 border-border-action bg-surface-cream p-0 text-primary-active shadow-raise-cream-sm
				hover:border-primary hover:bg-cream-hover active:shadow-raise-bar-action-sm`,
			},
			size: {
				default: '',
				sm: '',
			},
		},
		compoundVariants: [
			{ variant: 'primary', size: 'default', className: 'min-h-14 px-10 py-4 text-2xl' },
			{ variant: 'primary', size: 'sm', className: 'min-h-12 px-6 py-3 text-lg' },
			{ variant: 'secondary', size: 'default', className: 'min-h-11 px-5 py-3 text-base' },
			{ variant: 'secondary', size: 'sm', className: 'min-h-11 px-4 py-2.5 text-base' },
			{ variant: 'ghost', size: 'default', className: 'min-h-11 px-4 py-2.5 text-base' },
			{ variant: 'ghost', size: 'sm', className: 'min-h-11 px-3 py-2 text-sm' },
			{ variant: 'icon', size: 'default', className: 'size-11 text-xl' },
			{ variant: 'icon', size: 'sm', className: 'size-10 text-base' },
		],
		defaultVariants: {
			variant: 'primary',
			size: 'default',
		},
	},
);

type ButtonProps = Omit<ButtonPrimitive.Props, 'render'> & VariantProps<typeof buttonVariants>;

function Button({ className, variant = 'primary', size = 'default', disabled, ...props }: ButtonProps) {
	const reducedMotion = useReducedMotion();

	return (
		<ButtonPrimitive
			render={<m.button whileTap={reducedMotion || disabled ? undefined : buttonTap} />}
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			disabled={disabled}
			{...props}
		/>
	);
}

type ButtonLinkProps = HTMLMotionProps<'a'> & VariantProps<typeof buttonVariants> & { href: string };

function ButtonLink({ className, variant = 'secondary', size = 'default', ...props }: ButtonLinkProps) {
	const reducedMotion = useReducedMotion();

	return (
		<m.a
			whileTap={reducedMotion ? undefined : buttonTap}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

const GameButton = Button;
const GameButtonLink = ButtonLink;

export { Button, ButtonLink, GameButton, GameButtonLink, buttonVariants };
