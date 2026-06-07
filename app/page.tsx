import type { Metadata } from 'next'
import { IntroView } from '@/features/intro/intro-view'

// Server component shell. The intro itself is fully interactive ('use client',
// IntroView), so the route metadata export must live here — mirrors the
// result/page.tsx ↔ result-view.tsx split.
export const metadata: Metadata = {
    title: '앵무새 MBTI · 버디버드',
    description: '우리 앵무새의 성격은? 12문항으로 알아보는 앵무새 MBTI 테스트.',
}

export default function HomePage() {
    return <IntroView />
}
