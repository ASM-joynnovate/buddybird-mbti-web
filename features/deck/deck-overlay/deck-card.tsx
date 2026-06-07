'use client'

// One compact deck card, lifted by its own slice of the shared deck progress
// (clamp(p*2.1 - i*0.045, 0, 1) gives the per-index stagger).
import { m, useTransform, type MotionValue } from 'motion/react'
import { getTypeInfo } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { TradingCard } from '@/shared/ui/trading-card'
import { clamp } from './use-deck-controller'

export function DeckCard({
    code,
    index,
    progress,
    isOpen,
    onSelect,
}: {
    code: TypeCode
    index: number
    progress: MotionValue<number>
    isOpen: boolean
    onSelect: (code: TypeCode) => void
}) {
    const lift = useTransform(progress, (p) => clamp(p * 2.1 - index * 0.045, 0, 1))
    const y = useTransform(lift, (l) => (1 - l) * 96)
    const scale = useTransform(lift, (l) => 0.82 + 0.18 * l)
    const info = getTypeInfo(code)

    return (
        <m.button
            type="button"
            className="block w-full origin-bottom cursor-pointer p-0"
            style={{ opacity: lift, y, scale }}
            onClick={() => onSelect(code)}
            tabIndex={isOpen ? 0 : -1}
            aria-label={`${code} ${info?.name ?? ''}`.trim()}
            data-testid={`deck-card-${code}`}
        >
            <TradingCard code={code} compact loading="lazy" />
        </m.button>
    )
}
