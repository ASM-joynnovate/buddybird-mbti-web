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
                className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center text-ink"
            >
                <p className="text-ink-muted">결과 없음</p>
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="rounded-full bg-primary px-8 py-4 text-base font-bold text-on-primary"
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
            className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center text-ink"
        >
            <p data-testid="result-type" className="font-display text-6xl tracking-tight text-ink">
                {type}
            </p>
            {info !== null && (
                <>
                    <h1 className="font-display text-2xl text-ink">{info.name}</h1>
                    <p className="max-w-sm leading-relaxed text-ink-muted">{info.report}</p>
                </>
            )}
            <button
                type="button"
                data-testid="restart-button"
                onClick={handleRestart}
                className="mt-4 rounded-full border border-outline bg-[var(--color-surface)] px-8 py-4 text-base font-bold text-ink"
            >
                다시하기
            </button>
        </main>
    )
}
