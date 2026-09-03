'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

import type { TypeCode } from '@/types/mbti';

import type { DeckController } from '@/hooks/use-deck-controller';

import { getTypeInfo } from '@/lib/content/type-infos';
import { easeSpring } from '@/lib/motion/variants';

import { CardGhost } from '@/app/(forest)/_components/ui/card-ghost';
import { m, useReducedMotion, useTransform } from 'motion/react';

import { TradingCard } from '@/components/ui/trading-card';

export interface BackStackControls {
	setActive: (code: TypeCode) => void;
}

interface BackStackProps {
	pool: readonly TypeCode[];
	intervalMs?: number;
	controller: DeckController;
	onCardTap: (code: TypeCode) => void;
	paused?: boolean;
	controlsRef?: RefObject<BackStackControls | null>;
}

export function BackStack({
	pool,
	intervalMs = 3000,
	controller,
	onCardTap,
	paused = false,
	controlsRef,
}: BackStackProps) {
	const reduced = useReducedMotion();
	const [pos, setPos] = useState(0);
	const [hovered, setHovered] = useState(false);
	const hostRef = useRef<HTMLDivElement>(null);

	const len = pool.length;
	const idx = ((pos % len) + len) % len;
	const active = pool[idx] as TypeCode;
	const next1 = pool[(idx + 1) % len] as TypeCode;
	const next2 = pool[(idx + 2) % len] as TypeCode;
	const info = getTypeInfo(active);

	const { bindScrub, progress } = controller;

	useEffect(() => {
		if (reduced || hovered || paused || controller.isOpen || len <= 1) {
			return;
		}
		const timer = setInterval(() => {
			if (progress.get() > 0.001) {
				return;
			}
			setPos((prev) => prev + 1);
		}, intervalMs);
		return () => clearInterval(timer);
	}, [reduced, hovered, paused, controller.isOpen, len, intervalMs, progress]);

	useEffect(() => {
		if (controlsRef === undefined) {
			return;
		}
		controlsRef.current = {
			setActive: (code) => {
				const target = pool.indexOf(code);
				if (target >= 0) {
					setPos(target);
				}
			},
		};
		return () => {
			controlsRef.current = null;
		};
	}, [controlsRef, pool]);

	useEffect(() => {
		return bindScrub(hostRef.current);
	}, [bindScrub]);

	const stackOpacity = useTransform(progress, (p) => 1 - Math.min(1, p * 1.25));
	const stackY = useTransform(progress, (p) => -p * 60);
	const stackScale = useTransform(progress, (p) => 1 - p * 0.06);
	const stackPointer = useTransform(progress, (p) => (p > 0.05 ? 'none' : 'auto'));
	const hintOpacity = useTransform(progress, (p) => 1 - Math.min(1, p * 3));

	if (info === null) {
		return null;
	}

	return (
		<section
			className="flex w-full flex-col items-center"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onFocusCapture={() => setHovered(true)}
			onBlurCapture={() => setHovered(false)}
		>
			<div ref={hostRef} className="w-full max-w-md [touch-action:none]">
				<m.div
					className="relative w-full pb-6"
					style={{
						opacity: stackOpacity,
						y: stackY,
						scale: stackScale,
						pointerEvents: stackPointer,
					}}
				>
					<CardGhost code={next2} className="z-1 translate-y-6.5 scale-x-90 opacity-90" />
					<CardGhost code={next1} className="z-2 translate-y-3.5 scale-x-95" />

					<m.div
						key={active}
						className="relative z-3"
						initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
						animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
						transition={reduced ? { duration: 0.12 } : { duration: 0.46, ease: easeSpring }}
					>
						<button
							type="button"
							className="block w-full cursor-pointer p-0 text-left"
							onClick={() => onCardTap(active)}
							aria-label={`${active} ${info.name} 자세히 보기`}
							data-code={active}
						>
							<TradingCard code={active} loading="lazy" />
						</button>
					</m.div>
				</m.div>

				<m.div
					className="pointer-events-none mt-3 flex flex-col items-center gap-0.5 text-xs font-bold
						text-primary-active"
					style={{ opacity: hintOpacity }}
					aria-hidden="true"
				>
					<span>스크롤해서 전체 보기</span>
					{reduced ? (
						<i className="text-lg leading-[0.6] not-italic">⌄</i>
					) : (
						<m.i
							className="text-lg leading-[0.6] not-italic"
							animate={{ y: [0, 4, 0], opacity: [0.6, 1, 0.6] }}
							transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
						>
							⌄
						</m.i>
					)}
				</m.div>
			</div>

			<p className="sr-only" aria-live="polite">
				{active} {info.name}
			</p>
		</section>
	);
}
