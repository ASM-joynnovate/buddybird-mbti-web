'use client';

// Foil portrait window — the per-type gradient stage every parrot poses in
// (trading card, deck card, detail popup). Layers: --type-grad fill +
// shadow-window (inset gloss + white/action rings, from @theme) + a radial
// sheen + an infinite holo sweep + the bobbing parrot art. The holo/bob idle
// loops are m.* infinite tweens and are dropped entirely under
// prefers-reduced-motion (decoration only — PRD motion guardrails).
import type { CSSProperties, ReactNode } from 'react';

import type { TypeCode } from '@/lib/mbti';

import { typeGradient } from '@/content';
import { ParrotImage } from '@/shared/ui/parrot-image';
import { m, useReducedMotion } from 'motion/react';

// `framed` — the trading-card foil window (white + action rings, shadow-window);
// `hero` — the detail-popup portrait band (inset gloss only, no outer rings).
const VARIANT_CLASS = {
	framed: 'relative overflow-hidden shadow-window [background:var(--type-grad)]',
	hero: 'relative overflow-hidden shadow-[inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-14px_30px_rgba(0,0,0,0.24)] [background:var(--type-grad)]',
} as const;

interface PortraitWindowProps {
	code: TypeCode;
	/** Rendered + intrinsic size of the parrot art, px. */
	imgSize: number;
	variant?: keyof typeof VARIANT_CLASS;
	/** `bottom` — perched on the window's lower edge (hero cards, detail popup);
	 * `center` — vertically centred (compact deck cards). */
	align?: 'bottom' | 'center';
	/** Height / rounding / margin — the caller's concern. */
	className?: string;
	/** Extra overlays painted above the art (e.g. the detail popup code label). */
	children?: ReactNode;
	loading?: 'eager' | 'lazy';
}

export function PortraitWindow({
	code,
	imgSize,
	variant = 'framed',
	align = 'bottom',
	className,
	children,
	loading = 'eager',
}: PortraitWindowProps) {
	const reducedMotion = useReducedMotion();

	const classes = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ');

	return (
		<div className={classes} style={{ '--type-grad': typeGradient(code) } as CSSProperties}>
			{/* Top-left radial sheen (static). */}
			<span
				className="pointer-events-none absolute inset-0
					bg-[radial-gradient(130%_80%_at_26%_8%,rgba(255,255,255,0.5),transparent_56%)]"
				aria-hidden="true"
			/>

			{/* Holo sweep — slow infinite light band. Animates `x` (transform) not
                backgroundPosition so the loop stays on the compositor and never
                repaints; the parent's overflow-hidden clips the off-edge travel.
                Omitted under reduced motion. */}
			{!reducedMotion && (
				<m.span
					className="pointer-events-none absolute inset-0 mix-blend-overlay"
					style={{
						background:
							'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 47%, transparent 64%)',
					}}
					animate={{ x: ['120%', '-120%'] }}
					transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
					aria-hidden="true"
				/>
			)}

			{/* Bobbing parrot. `bottom` keeps the hero perch; `center` wraps the
                art in a flex-centred layer so the bob tween and the centring
                never share one transform. */}
			{align === 'center' ? (
				<span className="absolute inset-0 flex items-center justify-center">
					<m.div
						animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
						transition={reducedMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
					>
						<ParrotImage
							type={code}
							width={imgSize}
							height={imgSize}
							loading={loading}
							className="object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.3)]"
						/>
					</m.div>
				</span>
			) : (
				<m.div
					className="absolute -bottom-2 left-1/2"
					initial={{ x: '-50%' }}
					animate={
						reducedMotion
							? { x: '-50%' }
							: {
									x: '-50%',
									y: [0, -6, 0],
								}
					}
					transition={reducedMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
				>
					<ParrotImage
						type={code}
						width={imgSize}
						height={imgSize}
						loading={loading}
						className="object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.3)]"
					/>
				</m.div>
			)}

			{children}
		</div>
	);
}
