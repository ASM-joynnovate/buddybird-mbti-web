'use client';

import { cn } from '@/lib/utils';

import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import { type VariantProps, cva } from 'class-variance-authority';

const separatorVariants = cva('shrink-0', {
	variants: {
		variant: {
			default: `bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full
			data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch`,
			dashed: `h-0.5 w-full rounded-xs
			bg-[repeating-linear-gradient(90deg,var(--color-border-action)_0_7px,transparent_7px_12px)]`,
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

type SeparatorProps = SeparatorPrimitive.Props & VariantProps<typeof separatorVariants>;

function Separator({ className, orientation = 'horizontal', variant = 'default', ...props }: SeparatorProps) {
	return (
		<SeparatorPrimitive
			data-slot="separator"
			orientation={orientation}
			className={cn(separatorVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Separator, separatorVariants };
