import type { Metadata } from 'next'
import { Jua, Noto_Sans_KR } from 'next/font/google'
import { TestProgressProvider } from '@/features/quiz/test-progress-context'
import { MobileForestBackground } from '@/shared/forest/mobile-forest-background'
import { MotionProvider } from '@/shared/motion/motion-provider'
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
                {/* App-wide PNG forest backdrop — a single fixed layer behind every
                 * screen, pinned to the viewport (stays put on scroll). MotionProvider
                 * sits outermost so the forest's own m.* decorations (issue #26) get
                 * the LazyMotion context too; the background stays a Server Component
                 * (passed as children to the client provider). */}
                <MotionProvider>
                    <MobileForestBackground>
                        <TestProgressProvider>{children}</TestProgressProvider>
                    </MobileForestBackground>
                </MotionProvider>
            </body>
        </html>
    )
}
