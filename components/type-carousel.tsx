'use client'

// Intro carousel of the 16 parrot types (issue #06). Auto-advances by translating
// the track (compositor-friendly transform only), pauses under prefers-reduced-motion
// and on hover/focus, and exposes manual prev/next controls. The live caption names
// the current type for assistive tech.
import { useCallback, useEffect, useState } from 'react'
import { ParrotImage } from '@/components/parrot-image'
import { getTypeInfo } from '@/content'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import type { TypeCode } from '@/lib/mbti'
import './type-carousel.css'

interface TypeCarouselProps {
    types: readonly TypeCode[]
    intervalMs?: number
}

export function TypeCarousel({ types, intervalMs = 3500 }: TypeCarouselProps) {
    const reduced = useReducedMotion()
    const [index, setIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const count = types.length

    const go = useCallback(
        (delta: number) => {
            setIndex((prev) => (prev + delta + count) % count)
        },
        [count],
    )

    useEffect(() => {
        if (reduced || paused || count <= 1) {
            return
        }
        const timer = setInterval(() => setIndex((prev) => (prev + 1) % count), intervalMs)
        return () => clearInterval(timer)
    }, [reduced, paused, count, intervalMs])

    const current = types[index]
    const info = current !== undefined ? getTypeInfo(current) : null

    return (
        <div
            className="carousel"
            data-testid="intro-carousel"
            role="group"
            aria-roledescription="carousel"
            aria-label="앵무새 16유형 미리보기"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            <div className="carousel-stage">
                <button
                    type="button"
                    className="carousel-arrow carousel-arrow--prev"
                    data-testid="carousel-prev"
                    aria-label="이전 유형"
                    onClick={() => go(-1)}
                >
                    ‹
                </button>

                <div className="carousel-viewport">
                    <div
                        className="carousel-track"
                        style={{ transform: `translateX(-${index * 100}%)` }}
                    >
                        {types.map((type, i) => (
                            <div className="carousel-slide" key={type} aria-hidden={i !== index}>
                                <div className="carousel-frame">
                                    <ParrotImage
                                        type={type}
                                        width={480}
                                        height={480}
                                        loading={i === 0 ? 'eager' : 'lazy'}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    className="carousel-arrow carousel-arrow--next"
                    data-testid="carousel-next"
                    aria-label="다음 유형"
                    onClick={() => go(1)}
                >
                    ›
                </button>
            </div>

            <p className="carousel-caption" data-testid="carousel-caption" aria-live="polite">
                <span className="carousel-caption-code font-display">{current}</span>
                {info !== null && <span className="carousel-caption-name">{info.name}</span>}
            </p>
        </div>
    )
}
