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
            className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center"
        >
            <h1 className="text-2xl font-semibold tracking-tight">우리 앵무새 MBTI</h1>
            <p className="max-w-sm text-zinc-600">
                간단한 질문에 답하면 우리 앵무새의 성격 유형을 알려드려요.
            </p>
            <button
                type="button"
                data-testid="start-button"
                onClick={handleStart}
                className="rounded-md bg-zinc-900 px-6 py-3 text-base font-medium text-white"
            >
                테스트 시작하기
            </button>
        </main>
    )
}
