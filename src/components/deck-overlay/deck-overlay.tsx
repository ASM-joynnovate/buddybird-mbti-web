'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import type { TypeCode } from '@/types/mbti';

import { type DeckController, clamp } from '@/hooks/use-deck-controller';

import { CAROUSEL_TYPES } from '@/lib/content/assets';

import { m, useTransform } from 'motion/react';

import { GamePill } from '@/components/ui/badge';
import { GameButton } from '@/components/ui/button';

import { DeckCard } from './deck-card';

export interface DeckOverlayProps {
	controller: DeckController;
	onSelect: (code: TypeCode) => void;
}

export function DeckOverlay({ controller, onSelect }: DeckOverlayProps) {
	const { progress, isOpen, isEngaged, close } = controller;
	const scrollRef = useRef<HTMLDivElement>(null);
	const touchY = useRef<number | null>(null);

	const overlayOpacity = useTransform(progress, (p) => Math.min(1, p * 1.3));
	const headOpacity = useTransform(progress, (p) => clamp((p - 0.18) / 0.5, 0, 1));

	useEffect(() => {
		const el = scrollRef.current;
		if (el === null || !isOpen) {
			return;
		}
		const onWheel = (event: WheelEvent) => {
			if (event.deltaY < 0 && el.scrollTop <= 0) {
				event.preventDefault();
				close('gesture');
			}
		};
		const onTouchStart = (event: TouchEvent) => {
			touchY.current = event.touches[0]?.clientY ?? null;
		};
		const onTouchMove = (event: TouchEvent) => {
			if (touchY.current === null) {
				touchY.current = event.touches[0]?.clientY ?? null;
				return;
			}
			const dy = touchY.current - (event.touches[0]?.clientY ?? touchY.current);
			if (dy < -6 && el.scrollTop <= 0) {
				event.preventDefault();
				close('gesture');
				touchY.current = null;
			}
		};
		const onTouchEnd = () => {
			touchY.current = null;
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		el.addEventListener('touchstart', onTouchStart, { passive: true });
		el.addEventListener('touchmove', onTouchMove, { passive: false });
		el.addEventListener('touchend', onTouchEnd, { passive: true });
		return () => {
			el.removeEventListener('wheel', onWheel);
			el.removeEventListener('touchstart', onTouchStart);
			el.removeEventListener('touchmove', onTouchMove);
			el.removeEventListener('touchend', onTouchEnd);
		};
	}, [isOpen, close]);

	if (!isEngaged) {
		return null;
	}

	return createPortal(
		<m.div
			className="fixed inset-0 z-40 flex flex-col bg-[radial-gradient(120%_80%_at_50%_-10%,#fff8e3,#fbf3df_60%)]"
			style={{ opacity: overlayOpacity, pointerEvents: isOpen ? 'auto' : 'none' }}
			aria-hidden={!isOpen}
			inert={!isOpen}
			data-open={isOpen ? 'true' : 'false'}
		>
			<m.div
				className="flex flex-none items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)]
					pb-3"
				style={{ opacity: headOpacity }}
			>
				<GamePill bare className="px-4 py-2 font-display text-xl text-ink">
					전체 유형&nbsp;<b className="font-normal text-primary">16</b>
				</GamePill>
				<GameButton variant="icon" size="sm" onClick={() => close('button')} aria-label="닫기">
					✕
				</GameButton>
			</m.div>

			<div
				ref={scrollRef}
				className="min-h-0 flex-1 overflow-x-hidden overscroll-contain px-4 pt-1 pb-7
					[-webkit-overflow-scrolling:touch]"
				style={{ overflowY: isOpen ? 'auto' : 'hidden' }}
			>
				<div className="grid grid-cols-2 gap-4">
					{CAROUSEL_TYPES.map((code, index) => (
						<DeckCard
							key={code}
							code={code}
							index={index}
							progress={progress}
							isOpen={isOpen}
							onSelect={onSelect}
						/>
					))}
				</div>
			</div>
		</m.div>,
		document.body,
	);
}
