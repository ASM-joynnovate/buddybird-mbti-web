'use client'

// Compatibility ("궁합") chip — a per-type gradient dot + code + nickname that deep-
// links to the dex with that type focused (/dex?focus=CODE, opening its modal).
// Shown in the result match section and inside the type modal. Ported from the
// bundle MatchChip; rendered as a Link so it works under static export and stays
// keyboard-accessible. Game-chip skin (issue #21) lives in globals.css (.chip);
// the gradient border accent (--c1) is consumed by .chip:hover there. The tap
// press is Motion's cardTap (m.create(Link), LazyMotion convention) and is
// dropped under prefers-reduced-motion.
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { m, useReducedMotion } from 'motion/react'
import { getTypeInfo, typeColors } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { cardTap } from '@/lib/motion'

const MotionLink = m.create(Link)

interface MatchChipProps {
    code: TypeCode
}

export function MatchChip({ code }: MatchChipProps) {
    const reducedMotion = useReducedMotion()
    const info = getTypeInfo(code)
    if (info === null) {
        return null
    }

    const [c1, c2] = typeColors(code)
    const style = { '--c1': c1, '--c2': c2 } as CSSProperties

    return (
        <MotionLink
            href={`/dex?focus=${code}`}
            className="chip"
            style={style}
            whileTap={reducedMotion ? undefined : cardTap}
            data-testid={`match-chip-${code}`}
        >
            <span
                className="chip-dot"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                aria-hidden="true"
            />
            <span className="chip-code">{code}</span>
            <span className="chip-name">{info.name}</span>
        </MotionLink>
    )
}
