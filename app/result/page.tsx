import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ResultView } from '@/features/result/result-view'

// Shared/social-preview surface — gets its own metadata instead of inheriting
// the layout default, since this is the page people land on from shared links.
export const metadata: Metadata = {
    title: '내 앵무새 MBTI 결과 · 버디버드',
    description:
        '우리 앵무새의 MBTI 결과 카드가 도착했어요. 16가지 유형 중 우리 아이의 진짜 성격을 확인해 보세요.',
}

// Server component. useSearchParams() in ResultView must sit inside a Suspense
// boundary or the static export build fails.
export default function ResultPage() {
    return (
        <Suspense fallback={<div data-testid="result-loading">불러오는 중…</div>}>
            <ResultView />
        </Suspense>
    )
}
