import { Suspense } from 'react'
import { DexView } from './dex-view'

// Server component. useSearchParams() in DexView (reads ?mine / ?focus) must sit
// inside a Suspense boundary or the static export build fails.
export default function DexPage() {
    return (
        <Suspense fallback={<div data-testid="dex-loading">불러오는 중…</div>}>
            <DexView />
        </Suspense>
    )
}
