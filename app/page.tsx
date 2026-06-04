'use client'

// Intro (Landing) — a faithful recreation of the Claude Design bundle's Landing
// screen ("동화숲 월드"), minus the iOS frame / topbar / language toggle (excluded
// per the project scope: web-native, Korean-only). Structure mirrors the bundle:
// headline → full-bleed forest band → type peek row → dex entry → stats → big CTA,
// with the hero filling the viewport so the stats + CTA settle at the bottom.
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ParrotImage } from '@/components/parrot-image'
import { CAROUSEL_TYPES, QUESTION_COUNT, typeGradient } from '@/content'
import { track } from '@/lib/analytics'
import type { TypeCode } from '@/lib/mbti'
import { useTestProgress } from '@/lib/state/test-progress-context'
import './page.css'

// Peek order: a curated lead-in, then the remaining types (mirrors the bundle).
const PEEK_LEAD: readonly TypeCode[] = [
    'ENFP',
    'INTJ',
    'ESFP',
    'ISFP',
    'ENTP',
    'INFJ',
    'ENTJ',
    'ISFJ',
]
const PEEK_POOL: readonly TypeCode[] = [
    ...PEEK_LEAD,
    ...CAROUSEL_TYPES.filter((code) => !PEEK_LEAD.includes(code)),
]

// A single row of type tiles that auto-fits as many as the width allows (bundle
// PeekRow). The ResizeObserver callback is an external subscription, so its setState
// is the sanctioned pattern (no cascading-render warning).
function PeekRow({ pool }: { pool: readonly TypeCode[] }) {
    const ref = useRef<HTMLDivElement>(null)
    const [count, setCount] = useState(5)

    useEffect(() => {
        const el = ref.current
        if (el === null) {
            return
        }
        const TILE = 56
        const GAP = 12
        // ResizeObserver fires its callback once on observe() with the initial size,
        // so we don't call recalc() synchronously in the effect body.
        const observer = new ResizeObserver(() => {
            const fit = Math.floor((el.clientWidth + GAP) / (TILE + GAP))
            setCount(Math.max(3, Math.min(pool.length, fit)))
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [pool.length])

    return (
        <div className="peek-row" ref={ref}>
            {pool.slice(0, count).map((code) => (
                <span key={code} className="peek" style={{ background: typeGradient(code) }}>
                    <ParrotImage type={code} width={56} height={56} />
                </span>
            ))}
        </div>
    )
}

export default function Home() {
    const router = useRouter()
    const { reset, setIndex } = useTestProgress()

    const handleStart = () => {
        reset()
        setIndex(0)
        track({ name: 'test_start', payload: {} })
        router.push('/test')
    }

    return (
        <main data-testid="intro-root" className="hero">
            <div className="hero-first">
                <h1 className="hero-title font-display">
                    우리 앵무새
                    <br />
                    <span className="hl">진짜 성격</span>은?
                </h1>

                <PeekRow pool={PEEK_POOL} />

                <button
                    type="button"
                    data-testid="dex-button"
                    onClick={() => router.push('/dex')}
                    className="btn btn--ghost btn--sm hero-dex"
                >
                    16유형 도감 보기
                </button>

                <div className="hero-stats">
                    <div>
                        <b>16</b>유형
                    </div>
                    <span className="hero-stats-div" aria-hidden="true" />
                    <div>
                        <b>{QUESTION_COUNT}</b>질문
                    </div>
                    <span className="hero-stats-div" aria-hidden="true" />
                    <div>
                        <b>1분</b>소요
                    </div>
                </div>

                <button
                    type="button"
                    data-testid="start-button"
                    onClick={handleStart}
                    className="btn btn--lg hero-cta"
                >
                    테스트 시작하기 <span aria-hidden="true">→</span>
                </button>
            </div>
        </main>
    )
}
