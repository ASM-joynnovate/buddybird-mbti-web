'use client';

// Transient bottom toast for the 동화숲 raised-block system (DESIGN.md). Shown
// when `message` is non-null, auto-dismisses after AUTO_DISMISS_MS, then exits
// via AnimatePresence. A full-width orange CTA banner (gradient + white ink)
// pinned to the global gutter. Motion owns every transform (ADR-0008); under
// prefers-reduced-motion the entrance degrades to opacity-only.
import { useEffect, useRef } from 'react';

import { easeLeaf } from '@/shared/motion';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

const AUTO_DISMISS_MS = 3600;

interface ToastProps {
	message: string | null;
	onDismiss: () => void;
	'data-testid'?: string;
}

export function Toast({ message, onDismiss, ...rest }: ToastProps) {
	const reducedMotion = useReducedMotion();

	// Latest onDismiss without resetting the timer on every parent render.
	const onDismissRef = useRef(onDismiss);
	useEffect(() => {
		onDismissRef.current = onDismiss;
	});

	useEffect(() => {
		if (message === null) return;
		const id = window.setTimeout(() => onDismissRef.current(), AUTO_DISMISS_MS);
		return () => window.clearTimeout(id);
	}, [message]);

	const motionProps = reducedMotion
		? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
		: {
				initial: { opacity: 0, y: 24 },
				animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeLeaf } },
				exit: { opacity: 0, y: 12, transition: { duration: 0.2, ease: easeLeaf } },
			};

	return (
		<div
			className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] z-50 flex
				justify-center px-gutter"
		>
			<AnimatePresence>
				{message !== null && (
					<m.div
						key="toast"
						role="status"
						aria-live="polite"
						className="flex w-full items-center gap-3 rounded-card bg-(image:--gradient-cta) px-5 py-3.5
							text-on-primary shadow-raise-primary"
						{...motionProps}
						{...rest}
					>
						<span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/25 text-lg">
							📸
						</span>
						<p className="m-0 text-sm leading-snug font-medium">{message}</p>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}
