'use client';

import type { CSSProperties, ReactNode } from 'react';

import type { TypeCode } from '@/types/mbti';

import { typeGradient } from '@/lib/content/gradient';
import { cn } from '@/lib/utils';

import { m, useReducedMotion } from 'motion/react';

import { ParrotImage } from '@/components/ui/parrot-image';

const VARIANT_CLASS = {
	framed: 'relative overflow-hidden shadow-window [background:var(--type-grad)]',
	hero: 'relative overflow-hidden shadow-[inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-14px_30px_rgba(0,0,0,0.24)] [background:var(--type-grad)]',
} as const;

interface PortraitWindowProps {
	code: TypeCode;
	imgSize: number;
	variant?: keyof typeof VARIANT_CLASS;
	align?: 'bottom' | 'center';
	className?: string;
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

	const classes = cn(VARIANT_CLASS[variant], className);

	return (
		<div className={classes} style={{ '--type-grad': typeGradient(code) } as CSSProperties}>
			<span
				className="pointer-events-none absolute inset-0
					bg-[radial-gradient(130%_80%_at_26%_8%,rgba(255,255,255,0.5),transparent_56%)]"
				aria-hidden="true"
			/>

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
