'use client'

// Four MBTI axis spectrum bars for the result surface — the "성향 스펙트럼"
// GamePanel. Each row shows the playful end labels (e.g. 인싸앵(E) ↔ 집콕앵(I)),
// a recessed white pill track with a center-anchored colored segment, and a
// white knob ringed in the axis hue marking the lean.
//
// Motion: the fill and knob declare initial (center, zero width) → animate
// (target) with the shared easeSpring curve — a one-shot reveal, so animating
// left/width is acceptable (same allowance as the test progress bar). Under
// prefers-reduced-motion `initial={false}` snaps straight to the final state.
// The knob's centering translate lives in className — Motion only writes
// `left`, so the CSS transform is never overwritten.
//
// Data: `axisScores` (own result) carries real left/right tallies; for shared
// visitors the result view synthesizes equivalent tallies from the URL
// strengths, so this component only ever consumes axisScores.
import type { CSSProperties } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { GamePanel } from '@/components/ui/game-panel'
import { AXIS_META } from '@/content'
import { AXES, type Axis, type AxisScore } from '@/lib/mbti'
import { easeSpring } from '@/lib/motion'

interface AxisBarsProps {
    axisScores: Record<Axis, AxisScore>
}

const barTransition = { duration: 0.9, ease: easeSpring }

const END_CLASS = 'inline-flex items-baseline gap-1'
const END_ACTIVE_CLASS = 'inline-flex items-baseline gap-1 text-[var(--axis-color)]'

export function AxisBars({ axisScores }: AxisBarsProps) {
    const reducedMotion = useReducedMotion()

    return (
        <GamePanel
            as="section"
            aria-label="성향 스펙트럼"
            data-testid="axis-bars"
            className="px-[18px] pt-[18px] pb-5"
        >
            <h2 className="m-0 mb-4 font-display text-lg font-normal text-ink">성향 스펙트럼</h2>
            <div className="flex flex-col gap-[17px]">
                {AXES.map((axis) => {
                    const meta = AXIS_META[axis]
                    const { left, right } = axisScores[axis]
                    const total = left + right || 1
                    const knob = (right / total) * 100 // 0 = full left, 100 = full right
                    const leftActive = left >= right
                    const dominantPct = Math.round((Math.max(left, right) / total) * 100)

                    // Center-anchored segment: spans from 50% toward the leaning side.
                    const segStart = Math.min(50, knob)
                    const segWidth = Math.abs(knob - 50)

                    const style = { '--axis-color': meta.cssVar } as CSSProperties

                    return (
                        <div key={axis} style={style}>
                            <div className="mb-2 flex items-baseline justify-between text-[13px] font-semibold text-ink-muted">
                                <span className={leftActive ? END_ACTIVE_CLASS : END_CLASS}>
                                    {meta.left.label}
                                    <em className="text-[11px] not-italic opacity-65">
                                        ({meta.left.letter})
                                    </em>
                                    {leftActive && (
                                        <b className="mx-0.5 font-display text-sm font-normal">
                                            {dominantPct}%
                                        </b>
                                    )}
                                </span>
                                <span className={leftActive ? END_CLASS : END_ACTIVE_CLASS}>
                                    {!leftActive && (
                                        <b className="mx-0.5 font-display text-sm font-normal">
                                            {dominantPct}%
                                        </b>
                                    )}
                                    {meta.right.label}
                                    <em className="text-[11px] not-italic opacity-65">
                                        ({meta.right.letter})
                                    </em>
                                </span>
                            </div>
                            <div className="relative h-3.5 rounded-full border-2 border-border-action bg-white shadow-inset-track">
                                <m.span
                                    className="absolute top-0 bottom-0 rounded-full bg-[var(--axis-color)] shadow-[inset_0_2px_0_rgba(255,255,255,0.4)]"
                                    initial={reducedMotion ? false : { left: '50%', width: '0%' }}
                                    animate={{ left: `${segStart}%`, width: `${segWidth}%` }}
                                    transition={barTransition}
                                />
                                <m.span
                                    className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--axis-color)] bg-white shadow-[0_2px_6px_-1px_rgba(0,0,0,0.35)]"
                                    initial={reducedMotion ? false : { left: '50%' }}
                                    animate={{ left: `${knob}%` }}
                                    transition={barTransition}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </GamePanel>
    )
}
