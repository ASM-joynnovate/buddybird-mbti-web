'use client';

// Deck progress engine — one MotionValue `progress` (0..1) drives every layer
// of the deck system (replaces the /dex route, ADR-0007): the BackStack
// fades/lifts away, the overlay backdrop fades in, and each compact trading
// card rises with a per-index stagger. Input paths:
//
//   - wheel / touch-drag scrub on the BackStack host (bindScrub) — releasing
//     past OPEN_THRESHOLD snaps open, under it snaps shut
//   - the "16유형 모두 보기" button → openAnimated() (deterministic, e2e path)
//   - reduced motion: every snap is an instant progress jump
//
// Snaps run through the standalone animate() — safe alongside LazyMotion
// strict, which only guards m.* components.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type PayloadOf, trackEvent } from '@/shared/analytics';
import { easeLeaf } from '@/shared/motion';
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

// Analytics vocabulary, derived from the event contract so it cannot drift.
export type DeckSource = PayloadOf<'deck_open'>['source'];
export type DeckCloseTrigger = PayloadOf<'deck_close'>['trigger'];

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export interface DeckController {
	/** 0..1 scrub/open progress — shared by the overlay and the BackStack. */
	progress: MotionValue<number>;
	/** Fully open: native scroll + focusable cards + close gesture. */
	isOpen: boolean;
	/** Overlay should be mounted (progress > 0 or open). */
	isEngaged: boolean;
	/** Attach wheel/touch scrub listeners to the stack host. Returns cleanup. */
	bindScrub: (el: HTMLElement | null) => (() => void) | undefined;
	openAnimated: () => void;
	/**
	 * Close the deck. Pass the trigger for USER closes (emits deck_close);
	 * omit it for programmatic closes (e.g. the detail-popup CTA), which
	 * must not count as a user closing the deck.
	 */
	close: (trigger?: DeckCloseTrigger) => void;
}

// `source` names the surface that owns this deck instance (intro/result) and
// rides along on every deck_open / deck_close event.
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

	// Clear the pending scrub-release timer. Reads the ref at call time, so
	// callers (including the unmount cleanup) always cancel the latest timer
	// without touching `endTimer.current` inside an effect cleanup directly.
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
		// Guard BEFORE setOpen: the wheel path can reach progress 1 (immediate
		// reallyOpen) and then fire the 150ms snapEnd timer's reallyOpen again
		// — only the first commit counts as a deck_open.
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
		// Same duplicate guard as reallyOpen (covers button double-taps).
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
			// Only USER closes (trigger given) of an actually-open deck emit;
			// programmatic closes and snap-shut of a partial scrub stay silent.
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

	// Scrub release: past the threshold the deck commits open, under it snaps shut.
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

	// Clear the pending snap timer on unmount.
	useEffect(() => {
		return () => {
			clearEndTimer();
			stopSnap();
		};
	}, [clearEndTimer, stopSnap]);

	// Stable identity: consumers use `controller` as an effect dependency
	// (BackStack re-binds scrub listeners on change). Every member is already a
	// stable ref (MotionValue / useCallback) or tracked state, so this only
	// changes when isOpen / isEngaged flip — not on unrelated parent renders.
	return useMemo(
		() => ({ progress, isOpen, isEngaged, bindScrub, openAnimated, close }),
		[progress, isOpen, isEngaged, bindScrub, openAnimated, close],
	);
}
