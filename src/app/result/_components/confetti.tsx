'use client';

import { type CSSProperties, useState, useSyncExternalStore } from 'react';

import { AnimatePresence, m, useReducedMotion } from 'motion/react';

const COLORS = [
	'var(--color-faction-analyst)',
	'var(--color-faction-diplomat)',
	'var(--color-faction-sentinel)',
	'var(--color-faction-explorer)',
	'var(--color-gold)',
	'var(--color-primary-glow)',
];

const PIECE_COUNT = 24;

const FADE_DELAY = 1.5;
const FADE_DURATION = 0.3;

const noopSubscribe = () => () => {};

// useReducedMotion은 서버에서 null이라 첫 렌더를 서버와 맞추려면 하이드레이션 이후에만 그린다.
export function Confetti() {
	const reduced = useReducedMotion();
	const [done, setDone] = useState(false);
	const hydrated = useSyncExternalStore(
		noopSubscribe,
		() => true,
		() => false,
	);

	return (
		<AnimatePresence>
			{hydrated && !reduced && !done && (
				<m.div
					className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
					aria-hidden="true"
					initial={{ opacity: 1 }}
					animate={{
						opacity: 0,
						transition: { delay: FADE_DELAY, duration: FADE_DURATION },
					}}
					exit={{ opacity: 0, transition: { duration: 0.1 } }}
					onAnimationComplete={() => setDone(true)}
				>
					{Array.from({ length: PIECE_COUNT }, (_, i) => {
						const left = (i * 41) % 100;
						const delay = (i % 6) * 0.08;
						const duration = 1.1 + (i % 5) * 0.12;
						const color = COLORS[i % COLORS.length];
						const round = i % 3 === 0;
						const style = {
							left: `${left}%`,
							background: color,
							borderRadius: round ? '50%' : '2px',
						} as CSSProperties;
						return (
							<m.span
								className="absolute top-0 block size-2"
								key={i}
								style={style}
								initial={{ y: '-12vh', rotate: 0, opacity: 1 }}
								animate={{ y: '86vh', rotate: 640, opacity: 0 }}
								transition={{ delay, duration, ease: 'linear' }}
							/>
						);
					})}
				</m.div>
			)}
		</AnimatePresence>
	);
}
