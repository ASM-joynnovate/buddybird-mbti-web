'use client'

// Four MBTI axis spectrum bars for the result surface. Each row shows the playful
// end labels (e.g. 인싸새(E) ↔ 집콕새(I)), a track with a center-anchored colored
// segment, and a knob marking the lean. The fill grows from 0 to its target on mount
// for a springy reveal; reduced-motion users get an instant snap via the CSS guard.
//
// Data: `axisScores` (own result) carries real left/right tallies; for shared
// visitors the result view synthesizes equivalent tallies from the URL strengths,
// so this component only ever consumes axisScores.
import { useEffect, useState, type CSSProperties } from 'react'
import { AXIS_META } from '@/content'
import { AXES, type Axis, type AxisScore } from '@/lib/mbti'
import './axis-bars.css'

interface AxisBarsProps {
    axisScores: Record<Axis, AxisScore>
}

export function AxisBars({ axisScores }: AxisBarsProps) {
    // Arm the fill after first paint so the width/position transition runs.
    const [armed, setArmed] = useState(false)
    useEffect(() => {
        const id = requestAnimationFrame(() => setArmed(true))
        return () => cancelAnimationFrame(id)
    }, [])

    return (
        <section className="axis-bars" aria-label="성향 스펙트럼" data-testid="axis-bars">
            {AXES.map((axis) => {
                const meta = AXIS_META[axis]
                const { left, right } = axisScores[axis]
                const total = left + right || 1
                const knob = (right / total) * 100 // 0 = full left, 100 = full right
                const leftActive = left >= right
                const dominantPct = Math.round((Math.max(left, right) / total) * 100)

                // Center-anchored segment: spans from 50% toward the leaning side.
                const segStart = armed ? Math.min(50, knob) : 50
                const segWidth = armed ? Math.abs(knob - 50) : 0
                const knobPos = armed ? knob : 50

                const style = {
                    '--axis-color': meta.cssVar,
                    '--seg-start': `${segStart}%`,
                    '--seg-width': `${segWidth}%`,
                    '--knob-pos': `${knobPos}%`,
                } as CSSProperties

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
                            <span className="axis-fill" />
                            <span className="axis-knob" />
                        </div>
                    </div>
                )
            })}
        </section>
    )
}
