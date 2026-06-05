'use client'

// Four MBTI axis spectrum bars for the result surface. Each row shows the playful
// end labels (e.g. 인싸앵(E) ↔ 집콕앵(I)), a track with a center-anchored colored
// segment, and a knob marking the lean.
//
// Motion pass (issue #24, ADR-0006): the old "arm a CSS transition with a rAF
// after first paint" pattern is replaced by a Motion mount animation — the fill
// and knob declare initial (center, zero width) → animate (target) with the
// shared easeSpring curve, preserving the springy reveal. left/width are layout
// properties, but this is a one-shot reveal (same allowance as the test progress
// bar). Under prefers-reduced-motion `initial={false}` snaps straight to the
// final state. The section wears the .game-panel surface (issue #21).
//
// Data: `axisScores` (own result) carries real left/right tallies; for shared
// visitors the result view synthesizes equivalent tallies from the URL strengths,
// so this component only ever consumes axisScores.
import type { CSSProperties } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { AXIS_META } from '@/content'
import { AXES, type Axis, type AxisScore } from '@/lib/mbti'
import { easeSpring } from '@/lib/motion'
import './axis-bars.css'

interface AxisBarsProps {
    axisScores: Record<Axis, AxisScore>
}

const barTransition = { duration: 0.9, ease: easeSpring }

export function AxisBars({ axisScores }: AxisBarsProps) {
    const reducedMotion = useReducedMotion()

    return (
        <section
            className="axis-bars game-panel"
            aria-label="성향 스펙트럼"
            data-testid="axis-bars"
        >
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
                    <div className="axis-row" key={axis} style={style}>
                        <div className="axis-ends">
                            <span className={leftActive ? 'axis-end is-active' : 'axis-end'}>
                                {meta.left.label}
                                <em>({meta.left.letter})</em>
                                {leftActive && <b className="axis-pct">{dominantPct}%</b>}
                            </span>
                            <span
                                className={
                                    leftActive
                                        ? 'axis-end axis-end--right'
                                        : 'axis-end axis-end--right is-active'
                                }
                            >
                                {!leftActive && <b className="axis-pct">{dominantPct}%</b>}
                                {meta.right.label}
                                <em>({meta.right.letter})</em>
                            </span>
                        </div>
                        <div className="axis-track">
                            <m.span
                                className="axis-fill"
                                initial={reducedMotion ? false : { left: '50%', width: '0%' }}
                                animate={{ left: `${segStart}%`, width: `${segWidth}%` }}
                                transition={barTransition}
                            />
                            <m.span
                                className="axis-knob"
                                initial={reducedMotion ? false : { left: '50%' }}
                                animate={{ left: `${knob}%` }}
                                transition={barTransition}
                            />
                        </div>
                    </div>
                )
            })}
        </section>
    )
}
