'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { PayloadOf } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/track';
import { easeLeaf } from '@/lib/motion/variants';

import {
	type AnimationPlaybackControls,
	type MotionValue,
	animate,
	useMotionValue,
	useMotionValueEvent,
	useReducedMotion,
} from 'motion/react';

const OPEN_THRESHOLD = 0.34;
const WHEEL_GAIN = 0.0016;
const TOUCH_GAIN = 0.0042;

export type DeckSource = PayloadOf<'deck_open'>['source'];
export type DeckCloseTrigger = PayloadOf<'deck_close'>['trigger'];

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export interface DeckController {
	progress: MotionValue<number>;
	isOpen: boolean;
	isEngaged: boolean;
	bindScrub: (el: HTMLElement | null) => (() => void) | undefined;
	openAnimated: () => void;
	close: (trigger?: DeckCloseTrigger) => void;
}

export function useDeckController(source: DeckSource): DeckController {
	const progress = useMotionValue(0);
	const reduced = useReducedMotion();
	const [isOpen, setIsOpen] = useState(false);
	const [isEngaged, setIsEngaged] = useState(false);

	const isOpenRef = useRef(false);
	const animRef = useRef<AnimationPlaybackControls | null>(null);
	const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const touchY = useRef<number | null>(null);

	useMotionValueEvent(progress, 'change', (v) => {
		setIsEngaged(v > 0.001 || isOpenRef.current);
	});

	const stopSnap = useCallback(() => {
		animRef.current?.stop();
		animRef.current = null;
	}, []);

	const clearEndTimer = useCallback(() => {
		if (endTimer.current !== null) {
			clearTimeout(endTimer.current);
			endTimer.current = null;
		}
	}, []);

	const setOpen = useCallback((open: boolean) => {
		isOpenRef.current = open;
		setIsOpen(open);
		if (open) {
			setIsEngaged(true);
		}
	}, []);

	const reallyOpen = useCallback(() => {
		if (!isOpenRef.current) {
			trackEvent('deck_open', { source, trigger: 'scrub' });
		}
		clearEndTimer();
		stopSnap();
		setOpen(true);
		if (reduced) {
			progress.set(1);
			return;
		}
		animRef.current = animate(progress, 1, { duration: 0.28, ease: easeLeaf });
	}, [clearEndTimer, progress, reduced, setOpen, source, stopSnap]);

	const openAnimated = useCallback(() => {
		if (!isOpenRef.current) {
			trackEvent('deck_open', { source, trigger: 'button' });
		}
		clearEndTimer();
		stopSnap();
		setOpen(true);
		if (reduced) {
			progress.set(1);
			return;
		}
		animRef.current = animate(progress, 1, { duration: 0.46, ease: easeLeaf });
	}, [clearEndTimer, progress, reduced, setOpen, source, stopSnap]);

	const close = useCallback(
		(trigger?: DeckCloseTrigger) => {
			if (trigger !== undefined && isOpenRef.current) {
				trackEvent('deck_close', { source, trigger });
			}
			clearEndTimer();
			stopSnap();
			setOpen(false);
			if (reduced) {
				progress.set(0);
				setIsEngaged(false);
				return;
			}
			animRef.current = animate(progress, 0, { duration: 0.3, ease: easeLeaf });
		},
		[clearEndTimer, progress, reduced, setOpen, source, stopSnap],
	);

	const snapEnd = useCallback(() => {
		if (progress.get() >= OPEN_THRESHOLD) {
			reallyOpen();
			return;
		}
		if (reduced) {
			progress.set(0);
			return;
		}
		animRef.current = animate(progress, 0, { duration: 0.26, ease: easeLeaf });
	}, [progress, reduced, reallyOpen]);

	const bindScrub = useCallback(
		(el: HTMLElement | null) => {
			if (el === null) {
				return undefined;
			}

			const onWheel = (event: WheelEvent) => {
				if (isOpenRef.current) {
					return;
				}
				event.preventDefault();
				stopSnap();
				progress.set(clamp(progress.get() + event.deltaY * WHEEL_GAIN, 0, 1));
				clearEndTimer();
				endTimer.current = setTimeout(snapEnd, 150);
				if (progress.get() >= 1) {
					reallyOpen();
				}
			};

			const onTouchStart = (event: TouchEvent) => {
				if (!isOpenRef.current) {
					touchY.current = event.touches[0]?.clientY ?? null;
				}
			};
			const onTouchMove = (event: TouchEvent) => {
				if (isOpenRef.current || touchY.current === null) {
					return;
				}
				const cur = event.touches[0]?.clientY ?? touchY.current;
				const dy = touchY.current - cur;
				event.preventDefault();
				stopSnap();
				progress.set(clamp(progress.get() + dy * TOUCH_GAIN, 0, 1));
				touchY.current = cur;
				if (progress.get() >= 1) {
					reallyOpen();
					touchY.current = null;
				}
			};
			const onTouchEnd = () => {
				if (!isOpenRef.current && touchY.current !== null) {
					snapEnd();
				}
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
		},
		[clearEndTimer, progress, reallyOpen, snapEnd, stopSnap],
	);

	useEffect(() => {
		return () => {
			clearEndTimer();
			stopSnap();
		};
	}, [clearEndTimer, stopSnap]);

	return useMemo(
		() => ({ progress, isOpen, isEngaged, bindScrub, openAnimated, close }),
		[progress, isOpen, isEngaged, bindScrub, openAnimated, close],
	);
}
