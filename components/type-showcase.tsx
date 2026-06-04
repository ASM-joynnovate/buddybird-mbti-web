'use client'

// Intro type showcase (issues #14/#15/#16). Owns the single active-type index that
// the active card reads. Slice #14 fixes the index at the first type to lock the
// card's form (3:2 outer ratio, 5:9 inner columns, a padded 1:1 gradient tile on the
// left, type code/name + one-line report on the right). Slice #15 drives this index
// from a center-fixed infinite peek carousel; #16 layers tap + a11y on top.
import { useState } from 'react'
import { ParrotImage } from '@/components/parrot-image'
import { getTypeInfo, typeGradient } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import './type-showcase.css'

interface TypeShowcaseProps {
    pool: readonly TypeCode[]
}

export function TypeShowcase({ pool }: TypeShowcaseProps) {
    const len = pool.length
    // Single source of truth for the active type. Fixed at 0 in this slice; the peek
    // carousel (#15) will drive it. Normalised read keeps callers index-safe.
    const [pos] = useState(0)
    const active = pool[((pos % len) + len) % len]
    const info = active !== undefined ? getTypeInfo(active) : null

    if (active === undefined) {
        return null
    }

    return (
        <section className="showcase" data-testid="intro-showcase">
            <div className="showcase-card" data-testid="showcase-active-card">
                <figure className="showcase-card-figure">
                    <span
                        className="showcase-card-thumb"
                        style={{ background: typeGradient(active) }}
                    >
                        <ParrotImage type={active} width={120} height={120} loading="eager" />
                    </span>
                </figure>

                <div className="showcase-card-body">
                    <p className="showcase-card-head">
                        <span className="showcase-card-code font-display">{active}</span>
                        <span className="showcase-card-sep" aria-hidden="true">
                            |
                        </span>
                        <span className="showcase-card-name">{info?.name ?? active}</span>
                    </p>
                    {info !== null && <p className="showcase-card-desc">{info.report}</p>}
                </div>
            </div>
        </section>
    )
}
