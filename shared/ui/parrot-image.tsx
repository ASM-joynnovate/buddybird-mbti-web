'use client'

// Shared parrot image with a graceful fallback. Author-provided PNGs land in
// public/parrots/{imageKey}.png (issue #12); until then (or on any load error) we
// render a labelled placeholder so the carousel and result hero never collapse and
// the CLS budget holds. Reused by the intro carousel (#06), result hero (#07), and
// photo-preview card framing.
import { useCallback, useState } from 'react'
import Image from 'next/image'
import { getTypeInfo, parrotImageSrc } from '@/content'
import type { TypeCode } from '@/lib/mbti'
import { trackEvent } from '@/shared/analytics'

// Report a broken parrot asset once per type per page load — without the
// dedupe a single missing PNG would re-fire on every deck open / re-render.
const reportedTypes = new Set<TypeCode>()

function reportImageError(type: TypeCode): void {
    if (reportedTypes.has(type)) {
        return
    }
    reportedTypes.add(type)
    trackEvent('image_error', { type })
}

interface ParrotImageProps {
    type: TypeCode
    width: number
    height: number
    className?: string
    loading?: 'eager' | 'lazy'
}

export function ParrotImage({
    type,
    width,
    height,
    className,
    loading = 'lazy',
}: ParrotImageProps) {
    const [failed, setFailed] = useState(false)
    const info = getTypeInfo(type)
    const alt = info ? `${info.name} (${type}) 앵무새` : `${type} 앵무새`

    // A 404 can fire before React attaches onError during hydration, so also probe
    // the element on mount: a finished load with zero natural width means it failed.
    const checkBroken = useCallback(
        (node: HTMLImageElement | null) => {
            if (node !== null && node.complete && node.naturalWidth === 0) {
                reportImageError(type)
                setFailed(true)
            }
        },
        [type],
    )

    // Fallback fills its frame so the deck/result/preview layout never shifts.
    if (failed) {
        return (
            <span
                className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[linear-gradient(160deg,#fffdf6_0%,#f4e9cc_100%)] text-ink-muted ${className ?? ''}`}
                role="img"
                aria-label={alt}
            >
                <span className="text-[2.5rem] leading-none" aria-hidden="true">
                    🦜
                </span>
                <span className="font-display text-xl tracking-wider text-ink">{type}</span>
            </span>
        )
    }

    return (
        // next/image: the standalone Node server (ADR-0002) provides the image
        // optimizer, so the ~250KB type PNGs ship resized + WebP/AVIF. quality
        // 65: the clean flat character art compresses transparently in AVIF
        // (Lighthouse flagged the q75 default as ~30% over-budget). The
        // share-card Canvas composes from the user photo + brand logo only, so
        // it never depends on this element's URL.
        <Image
            ref={checkBroken}
            src={parrotImageSrc(type)}
            alt={alt}
            width={width}
            height={height}
            quality={65}
            loading={loading}
            className={className}
            onError={() => {
                reportImageError(type)
                setFailed(true)
            }}
        />
    )
}
