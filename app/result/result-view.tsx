'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { getTypeInfo } from '@/content'
import { decodeResult, RESULT_PARAM } from '@/lib/result-url'
import { useTestProgress } from '@/lib/state/test-progress-context'

// TODO(#07/#08/#09/#10): photo, share card, app CTA

export function ResultView() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { result, reset } = useTestProgress()

    // Precedence: URL param -> in-memory progress -> none.
    const type = decodeResult(searchParams.get(RESULT_PARAM)) ?? result?.type ?? null

    const handleRestart = () => {
        reset()
        router.push('/')
    }

    if (type === null) {
        return (
            <main
                data-testid="result-root"
                className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center"
            >
                <p className="text-zinc-600">결과 없음</p>
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="rounded-md bg-zinc-900 px-6 py-3 text-base font-medium text-white"
                >
                    처음으로
                </button>
            </main>
        )
    }

    const info = getTypeInfo(type)

    return (
        <main
            data-testid="result-root"
            className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center"
        >
            <p data-testid="result-type" className="text-3xl font-bold tracking-tight">
                {type}
            </p>
            {info !== null && (
                <>
                    <h1 className="text-xl font-semibold">{info.name}</h1>
                    <p className="max-w-sm text-zinc-600">{info.report}</p>
                </>
            )}
            <button
                type="button"
                data-testid="restart-button"
                onClick={handleRestart}
                className="mt-4 rounded-md border border-zinc-300 px-6 py-3 text-base font-medium"
            >
                다시하기
            </button>
        </main>
    )
}
