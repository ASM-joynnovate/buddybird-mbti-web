'use client'

// Celebratory confetti burst, mounted once on the result surface. Honors
// reduced-motion (renders nothing) and never affects layout (fixed,
// pointer-events: none, aria-hidden).
//
// Motion pass (issue #24, ADR-0006): the layer's lifetime is Motion-managed —
// the m.div animates a tail fade (delay ≈ when the last piece lands, then a
// short opacity ramp); onAnimationComplete flips `done` and AnimatePresence
// retires the layer. This replaces the old setTimeout(1800ms) unmount with no
// timer at all. The PIECES THEMSELVES stay on the CSS `confetti-fall` keyframe:
// 24 decorative, non-interactive sprites are exactly the "many cheap decorations"
// case where per-particle Motion components would buy nothing but bundle work
// and per-frame JS — the low-cost principle recorded in the issue.
import { useState, type CSSProperties } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import './confetti.css'

// Group + axis palette — celebratory, on-system colors.
const COLORS = [
    'var(--color-group-ruby)',
    'var(--color-group-marigold)',
    'var(--color-group-teal)',
    'var(--color-group-cobalt)',
    'var(--color-axis-sn)',
    'var(--color-axis-tf)',
]

const PIECE_COUNT = 24

// Slowest piece: 0.4s max delay + 1.58s max fall ≈ 2s; pieces fade themselves
// out at the end of the fall, so starting the layer fade at 1.5s and finishing
// by 1.8s matches the old RUN_MS=1800 visible lifetime.
const FADE_DELAY = 1.5
const FADE_DURATION = 0.3

export function Confetti() {
    const reduced = useReducedMotion()
    const [done, setDone] = useState(false)

    return (
        <AnimatePresence>
            {!reduced && !done && (
                <m.div
                    className="confetti"
                    aria-hidden="true"
                    data-testid="confetti"
                    initial={{ opacity: 1 }}
                    animate={{
                        opacity: 0,
                        transition: { delay: FADE_DELAY, duration: FADE_DURATION },
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    onAnimationComplete={() => setDone(true)}
                >
                    {Array.from({ length: PIECE_COUNT }, (_, i) => {
                        // Deterministic spread from the index — no Math.random (SSR-stable).
                        const left = (i * 41) % 100
                        const delay = (i % 6) * 0.08
                        const duration = 1.1 + (i % 5) * 0.12
                        const color = COLORS[i % COLORS.length]
                        const round = i % 3 === 0
                        const style = {
                            '--c-left': `${left}%`,
                            '--c-delay': `${delay}s`,
                            '--c-duration': `${duration}s`,
                            '--c-color': color,
                            borderRadius: round ? '50%' : '2px',
                        } as CSSProperties
                        return <span className="confetti-piece" key={i} style={style} />
                    })}
                </m.div>
            )}
        </AnimatePresence>
    )
}
