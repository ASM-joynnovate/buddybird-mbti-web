'use client'

// Intro (Landing) — a faithful recreation of the Claude Design bundle's Landing
// screen ("동화숲 월드"), minus the iOS frame / topbar / language toggle (excluded
// per the project scope: web-native, Korean-only). Structure mirrors the bundle:
// headline → full-bleed forest band → type peek row → dex entry → stats → big CTA,
// with the hero filling the viewport so the stats + CTA settle at the bottom.
import { useRouter } from 'next/navigation'
import { GameButton } from '@/components/game-button'
import { TypeShowcase } from '@/components/type-showcase'
import { CAROUSEL_TYPES, QUESTION_COUNT } from '@/content'
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
                {/* Group 1 — headline + type showcase (top of the screen). */}
                <div className="hero-group hero-group--top">
                    <h1 className="hero-title font-display">
                        우리 앵무새
                        <br />
                        <span className="hl">진짜 성격</span>은?
                    </h1>

                    <TypeShowcase pool={PEEK_POOL} intervalMs={3000} />
                </div>

                {/* Group 2 — dex entry + stats (middle of the screen). */}
                <div className="hero-group hero-group--mid">
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
                </div>

                {/* Group 3 — primary CTA (bottom of the screen). */}
                <div className="hero-group hero-group--bottom">
                    <GameButton
                        data-testid="start-button"
                        onClick={handleStart}
                        className="hero-cta"
                    >
                        테스트 시작하기 <span aria-hidden="true">→</span>
                    </GameButton>
                </div>
            </div>
        </main>
    )
}
