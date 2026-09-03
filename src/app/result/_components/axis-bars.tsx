'use client';

import type { CSSProperties } from 'react';

import { AXES, type Axis, type AxisScore } from '@/types/mbti';

import { AXIS_META } from '@/lib/content/axes';
import { easeSpring } from '@/lib/motion/variants';

import { Marker } from '@/app/result/_components/ui/emphasize';
import { m, useReducedMotion } from 'motion/react';

import { GamePanel } from '@/components/ui/card';

interface AxisBarsProps {
	axisScores: Record<Axis, AxisScore>;
}

const barTransition = { duration: 0.9, ease: easeSpring };

const END_CLASS = 'inline-flex items-baseline gap-1';
const END_ACTIVE_CLASS = 'inline-flex items-baseline gap-1 text-[var(--axis-color)]';

export function AxisBars({ axisScores }: AxisBarsProps) {
	const reducedMotion = useReducedMotion();

	return (
		<GamePanel as="section" aria-label="성향 스펙트럼" className="px-4 pt-4 pb-5">
			<h2 className="m-0 mb-4 font-display text-lg font-normal text-ink">
				<Marker variant="head">성향 스펙트럼</Marker>
			</h2>
			<div className="flex flex-col gap-4">
				{AXES.map((axis) => {
					const meta = AXIS_META[axis];
					const { left, right } = axisScores[axis];
					const total = left + right || 1;
					const knob = (right / total) * 100;
					const leftActive = left >= right;
					const dominantPct = Math.round((Math.max(left, right) / total) * 100);

					const segStart = Math.min(50, knob);
					const segWidth = Math.abs(knob - 50);

					const style = { '--axis-color': meta.cssVar } as CSSProperties;

					return (
						<div key={axis} style={style}>
							<div
								className="mb-2 flex items-baseline justify-between text-sm font-semibold
									text-ink-muted"
							>
								<span className={leftActive ? END_ACTIVE_CLASS : END_CLASS}>
									{meta.left.label}
									<em className="text-xs not-italic opacity-65">({meta.left.letter})</em>
									{leftActive && (
										<b
											className="mx-0.5 rounded-xs px-1 font-display text-sm font-normal
												[background:linear-gradient(180deg,transparent_52%,color-mix(in_srgb,var(--axis-color)_32%,#fff)_52%,color-mix(in_srgb,var(--axis-color)_32%,#fff)_96%,transparent_96%)]"
										>
											{dominantPct}%
										</b>
									)}
								</span>
								<span className={leftActive ? END_CLASS : END_ACTIVE_CLASS}>
									{!leftActive && (
										<b
											className="mx-0.5 rounded-xs px-1 font-display text-sm font-normal
												[background:linear-gradient(180deg,transparent_52%,color-mix(in_srgb,var(--axis-color)_32%,#fff)_52%,color-mix(in_srgb,var(--axis-color)_32%,#fff)_96%,transparent_96%)]"
										>
											{dominantPct}%
										</b>
									)}
									{meta.right.label}
									<em className="text-xs not-italic opacity-65">({meta.right.letter})</em>
								</span>
							</div>
							<div
								className="relative h-4.5 rounded-full border-2 border-border-action bg-white
									shadow-inset-track"
							>
								<m.span
									className="absolute top-0 bottom-0 rounded-full shadow-inset-highlight
										[background:linear-gradient(180deg,color-mix(in_srgb,#fff_24%,var(--axis-color)),var(--axis-color))]"
									initial={reducedMotion ? false : { left: '50%', width: '0%' }}
									animate={{ left: `${segStart}%`, width: `${segWidth}%` }}
									transition={barTransition}
								/>
								<m.span
									className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full
										border-[length:var(--border-ring)] border-[var(--axis-color)] bg-white
										shadow-[0_2px_6px_-1px_rgba(0,0,0,0.35)]"
									initial={reducedMotion ? false : { left: '50%' }}
									animate={{ left: `${knob}%` }}
									transition={barTransition}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</GamePanel>
	);
}
