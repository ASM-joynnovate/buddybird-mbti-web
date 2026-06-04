'use client'

// Celebratory confetti burst, mounted once on the result surface. Pieces fall and
// spin via the shared `confetti-fall` keyframe, then the layer unmounts itself after
// the run so nothing lingers in the DOM. Honors reduced-motion (renders nothing) and
// never affects layout (fixed, pointer-events: none, aria-hidden).
import { useEffect, useState, type CSSProperties } from 'react'
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
const RUN_MS = 1800

export function Confetti() {
    const reduced = useReducedMotion()
    const [done, setDone] = useState(false)

    useEffect(() => {
        const id = setTimeout(() => setDone(true), RUN_MS)
        return () => clearTimeout(id)
    }, [])

    if (reduced || done) {
        return null
    }

    return (
        <div className="confetti" aria-hidden="true" data-testid="confetti">
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
        </div>
    )
}
