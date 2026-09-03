import { cn } from '@/lib/utils';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { type VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva('inline-flex items-center rounded-full', {
	variants: {
		variant: {
			cream: 'border-2 border-border-action bg-surface-cream shadow-raise-bar-action',
			orange: 'bg-(image:--gradient-cta) shadow-raise-bar-primary',
		},
	},
	defaultVariants: {
		variant: 'cream',
	},
});

const badgeSize = {
	cream: 'gap-2 px-4 py-1.5 text-sm font-bold text-primary-active',
	orange: 'gap-1.5 px-3.5 py-1 font-display text-sm tracking-wider text-on-primary',
};

type BadgeProps = useRender.ComponentProps<'span'> &
	VariantProps<typeof badgeVariants> & {
		bare?: boolean;
	};

function Badge({ className, variant = 'cream', bare = false, render, ...props }: BadgeProps) {
	const resolvedVariant = variant ?? 'cream';

	return useRender({
		defaultTagName: 'span',
		props: mergeProps<'span'>(
			{
				className: cn(
					badgeVariants({ variant: resolvedVariant }),
					!bare && badgeSize[resolvedVariant],
					className,
				),
			},
			props,
		),
		render,
		state: {
			slot: 'badge',
			variant: resolvedVariant,
		},
	});
}

const GamePill = Badge;

export { Badge, GamePill, badgeVariants };
