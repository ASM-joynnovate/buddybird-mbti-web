import type { CSSProperties } from 'react';

import type { TypeCode } from '@/types/mbti';

import { typeColors, typeGradient } from '@/lib/content/gradient';
import { cn } from '@/lib/utils';

interface CardGhostProps {
	code: TypeCode;
	className?: string;
}

export function CardGhost({ code, className }: CardGhostProps) {
	const classes = cn(
		'absolute inset-0 origin-top rounded-card shadow-ghost [background:var(--type-grad)]',
		className,
	);
	const [c1] = typeColors(code);

	return (
		<div className={classes} style={{ '--type-grad': typeGradient(code) } as CSSProperties} aria-hidden="true">
			<span
				className="pointer-events-none absolute inset-0.5 rounded-lg border-[length:var(--border-hair)]
					border-white/50"
			/>
			<span
				className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full
					bg-ink px-3 py-0.5 font-display text-xs tracking-wider text-white"
			>
				<i
					className="size-2 rounded-full shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.7)]"
					style={{ background: c1 }}
				/>
				{code}
			</span>
		</div>
	);
}
