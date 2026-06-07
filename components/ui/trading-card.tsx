'use client'

// The hero collectible — "수집형 트레이딩 카드" (DESIGN.md card-trading): an
// orange gradient frame wrapping a cream inner card with a foil portrait
// window, the CODE | 이름 head row, a dashed rule, and a short blurb. `compact`
// (deck overlay grid) shows only CODE / rule / 이름 and uses the smaller frame
// shadow. Always fills its container width.
import { getTypeInfo } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { DashedRule } from './dashed-rule'
import { PortraitWindow } from './portrait-window'

interface TradingCardProps {
    code: TypeCode
    /** Deck-grid mode: CODE / rule / name only, smaller window + shadow. */
    compact?: boolean
    loading?: 'eager' | 'lazy'
}

export function TradingCard({ code, compact = false, loading = 'eager' }: TradingCardProps) {
    const info = getTypeInfo(code)

    return (
        <div
            className={
                compact
                    ? 'relative w-full rounded-card bg-(image:--gradient-card-frame) p-1.5 shadow-card-frame-sm'
                    : 'relative w-full rounded-card bg-(image:--gradient-card-frame) p-1.5 shadow-card-frame'
            }
        >
            <div className="relative overflow-hidden rounded-lg border-[1.5px] border-white bg-surface-cream">
                {/* Compact deck cards centre the parrot in the window; the full
                    hero card keeps the bottom perch. */}
                <PortraitWindow
                    code={code}
                    imgSize={compact ? 104 : 150}
                    align={compact ? 'center' : 'bottom'}
                    loading={loading}
                    className={
                        compact
                            ? 'mx-2 mt-2 h-[clamp(6rem,30vw,7.5rem)] rounded-md'
                            : 'mx-2 mt-2 h-[clamp(7.375rem,36vw,9.375rem)] rounded-md'
                    }
                />

                {compact ? (
                    <div className="flex flex-col items-center px-3.5 pt-3 pb-4 text-center">
                        <span className="font-display text-xl leading-none tracking-wider text-primary-active">
                            {code}
                        </span>
                        <DashedRule className="my-2 w-full" />
                        <span className="font-display text-sm leading-tight break-keep text-ink">
                            {info?.name ?? code}
                        </span>
                    </div>
                ) : (
                    <div className="px-4 pt-3 pb-3.5">
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="flex-none font-display text-2xl leading-none tracking-wider text-primary-active">
                                {code}
                            </span>
                            <span className="min-w-0 text-right font-display text-lg leading-[1.15] text-balance break-keep text-ink">
                                {info?.name ?? code}
                            </span>
                        </div>
                        <DashedRule className="my-2.5" />
                        <p className="m-0 text-sm leading-normal text-ink-muted">
                            {info?.report ?? ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
