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
                    ? 'relative w-full rounded-card bg-[linear-gradient(160deg,var(--color-primary-glow),var(--color-primary)_55%,var(--color-primary-active))] p-1.5 shadow-card-frame-sm'
                    : 'relative w-full rounded-card bg-[linear-gradient(160deg,var(--color-primary-glow),var(--color-primary)_55%,var(--color-primary-active))] p-1.5 shadow-card-frame'
            }
        >
            <div className="relative overflow-hidden rounded-[19px] border-[1.5px] border-white bg-surface-cream">
                <PortraitWindow
                    code={code}
                    imgSize={compact ? 124 : 172}
                    loading={loading}
                    className={
                        compact
                            ? 'mx-[9px] mt-[9px] h-[clamp(96px,30vw,120px)] rounded-md'
                            : 'mx-[9px] mt-[9px] h-[clamp(140px,46vw,178px)] rounded-md'
                    }
                />

                {compact ? (
                    <div className="flex flex-col items-center px-3.5 pt-3 pb-[15px] text-center">
                        <span className="font-display text-[22px] leading-none tracking-[0.05em] text-primary-active">
                            {code}
                        </span>
                        <DashedRule className="my-[9px] w-full" />
                        <span className="font-display text-[13.5px] leading-[1.25] break-keep text-ink">
                            {info?.name ?? code}
                        </span>
                    </div>
                ) : (
                    <div className="px-4 pt-3.5 pb-[17px]">
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="flex-none font-display text-[28px] leading-none tracking-[0.04em] text-primary-active">
                                {code}
                            </span>
                            <span className="min-w-0 text-right font-display text-[19px] leading-[1.15] text-balance break-keep text-ink">
                                {info?.name ?? code}
                            </span>
                        </div>
                        <DashedRule className="my-[11px]" />
                        <p className="m-0 text-[13px] leading-normal text-ink-muted">
                            {info?.report ?? ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
