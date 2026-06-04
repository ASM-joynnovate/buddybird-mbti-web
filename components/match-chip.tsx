'use client'

// Compatibility ("궁합") chip — a per-type gradient dot + code + nickname that deep-
// links to the dex with that type focused (/dex?focus=CODE, opening its modal).
// Shown in the result match section and inside the type modal. Ported from the
// bundle MatchChip; rendered as a Link so it works under static export and stays
// keyboard-accessible. The gradient border accent (--c1) is consumed by .chip:hover
// in globals.css.
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { getTypeInfo, typeColors } from '@/content'
import type { TypeCode } from '@/lib/mbti'

interface MatchChipProps {
    code: TypeCode
}

export function MatchChip({ code }: MatchChipProps) {
    const info = getTypeInfo(code)
    if (info === null) {
        return null
    }

    const [c1, c2] = typeColors(code)
    const style = { '--c1': c1, '--c2': c2 } as CSSProperties

    return (
        <Link
            href={`/dex?focus=${code}`}
            className="chip"
            style={style}
            data-testid={`match-chip-${code}`}
        >
            <span
                className="chip-dot"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                aria-hidden="true"
            />
            <span className="chip-code">{code}</span>
            <span className="chip-name">{info.name}</span>
        </Link>
    )
}
