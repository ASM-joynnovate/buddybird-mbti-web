import { Suspense } from 'react'
import { ResultView } from './result-view'

// Server component. useSearchParams() in ResultView must sit inside a Suspense
// boundary or the static export build fails.
export default function ResultPage() {
    return (
        <Suspense fallback={<div data-testid="result-loading">불러오는 중…</div>}>
            <ResultView />
        </Suspense>
    )
}
