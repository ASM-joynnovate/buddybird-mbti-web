'use client'

import { useRouter } from 'next/navigation'
import { AppCtaButton } from '@/components/app-cta-button'
import { TypeCarousel } from '@/components/type-carousel'
import { CAROUSEL_TYPES } from '@/content'
import { track } from '@/lib/analytics'
import { useTestProgress } from '@/lib/state/test-progress-context'

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
        <main
            data-testid="intro-root"
            className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center text-ink"
        >
            <header className="flex flex-col items-center gap-3">
                <h1 className="font-display text-4xl tracking-tight text-ink">우리 앵무새 MBTI</h1>
                <p className="max-w-sm text-base leading-relaxed text-ink-muted">
                    간단한 질문에 답하면 우리 앵무새의 성격 유형을 알려드려요.
                </p>
            </header>

            <TypeCarousel types={CAROUSEL_TYPES} />

            <div className="flex flex-col items-center gap-3">
                <button
                    type="button"
                    data-testid="start-button"
                    onClick={handleStart}
                    className="rounded-full bg-primary px-8 py-4 text-base font-bold text-on-primary shadow-[0_14px_32px_-12px_rgba(27,94,52,0.45)] transition-transform focus-visible:[outline:3px_solid_var(--color-primary)] focus-visible:[outline-offset:2px] active:scale-[0.98]"
                >
                    테스트 시작하기
                </button>
                <AppCtaButton placement="intro" />
            </div>
        </main>
    )
}
