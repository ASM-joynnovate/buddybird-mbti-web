import type { Metadata } from 'next'
import { Jua, Noto_Sans_KR } from 'next/font/google'
import { TestProgressProvider } from '@/lib/state/test-progress-context'
import './globals.css'

// Display — Jua (rounded Korean gothic). Single weight (400); hierarchy from size.
const jua = Jua({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-jua',
})

// Body — Pretendard stand-in. Pretendard is not on Google Fonts; DESIGN.md names
// Noto Sans KR as the fallback. preload:false skips the large Korean-subset preload.
const notoSansKr = Noto_Sans_KR({
    weight: ['400', '500', '700'],
    subsets: ['latin'],
    preload: false,
    variable: '--font-noto-kr',
})

export const metadata: Metadata = {
    title: '앵무새 MBTI · 버디버드',
    description: '우리 앵무새의 성격은? 12문항으로 알아보는 앵무새 MBTI 테스트.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ko" className={`${jua.variable} ${notoSansKr.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col">
                {/* App-wide floating leaf backdrop (동화숲) — fixed, behind every screen. */}
                <div className="bg-decor" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                </div>
                <TestProgressProvider>{children}</TestProgressProvider>
            </body>
        </html>
    )
}
