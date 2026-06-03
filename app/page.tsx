'use client'

import { useRouter } from 'next/navigation'
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
            className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center text-ink"
        >
            <h1 className="font-display text-4xl tracking-tight text-ink">우리 앵무새 MBTI</h1>
            <p className="max-w-sm text-base leading-relaxed text-ink-muted">
                간단한 질문에 답하면 우리 앵무새의 성격 유형을 알려드려요.
            </p>
            <button
                type="button"
                data-testid="start-button"
                onClick={handleStart}
                className="mt-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-on-primary shadow-[0_14px_32px_-12px_rgba(27,94,52,0.45)] transition-transform active:scale-[0.98]"
            >
                테스트 시작하기
            </button>
        </main>
    )
}
