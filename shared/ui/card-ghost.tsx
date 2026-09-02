// A peeking card-back behind the active trading card (the deck illusion).
// Per-type gradient slab + inner white edge + a small code tag pill. Purely
// decorative (aria-hidden); the offset/scale stance comes from the caller via
// className (ghost-1 / ghost-2 transforms live in BackStack).
import type { CSSProperties } from 'react';

import type { TypeCode } from '@/lib/mbti';

import { typeColors, typeGradient } from '@/content';

interface CardGhostProps {
	code: TypeCode;
	className?: string;
}

export function CardGhost({ code, className }: CardGhostProps) {
	const classes = ['absolute inset-0 origin-top rounded-card shadow-ghost [background:var(--type-grad)]', className]
		.filter(Boolean)
		.join(' ');
	const [c1] = typeColors(code);

	return (
		<div className={classes} style={{ '--type-grad': typeGradient(code) } as CSSProperties} aria-hidden="true">
			<span
				className="pointer-events-none absolute inset-0.5 rounded-lg border-[length:var(--border-hair)]
					border-white/50"
			/>
			{/* Translucent tag is required here: it floats over an arbitrary
                per-type gradient, so no opaque mix target exists. */}
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
