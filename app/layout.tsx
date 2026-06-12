import type { Metadata } from 'next'
import { Jua } from 'next/font/google'
import { TestProgressProvider } from '@/features/quiz/test-progress-context'
import { AnalyticsBootstrap } from '@/shared/analytics/analytics-bootstrap'
import { MobileForestBackground } from '@/shared/forest/mobile-forest-background'
import { MotionProvider } from '@/shared/motion/motion-provider'
import './globals.css'

// Display — Jua (rounded Korean gothic). Single weight (400); hierarchy from size.
// preload:false — only the LATIN subset can be preloaded (Korean subsets always
// load on demand via unicode-range), and that 13KB high-priority head preload
// competed with the LCP canopy image for bandwidth while covering almost no
// visible text on this Korean page. font-display:swap keeps text readable.
const jua = Jua({
    weight: '400',
    subsets: ['latin'],
    preload: false,
    variable: '--font-jua',
})

// EXPERIMENT: body font → system Korean stack (see globals.css --font-sans).

export const metadata: Metadata = {
    title: '앵BTI · 버디버드',
    description: '우리 앵무새의 성격은? 12문항으로 알아보는 앵BTI 테스트.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ko" className={`${jua.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col">
                {/* App-wide PNG forest backdrop — a single fixed layer behind every
                 * screen, pinned to the viewport (stays put on scroll). MotionProvider
                 * sits outermost so the forest's own m.* decorations (issue #26) get
                 * the LazyMotion context too; the background stays a Server Component
                 * (passed as children to the client provider). */}
                {/* Null-render client component: lazily boots Firebase (GA4 /
                 * Performance / Remote Config, ADR-0011) and Microsoft Clarity
                 * (ADR-0015) on idle or first interaction so the SDK chunks
                 * stay off the critical path. */}
                <AnalyticsBootstrap />
                <MotionProvider>
                    <MobileForestBackground>
                        <TestProgressProvider>{children}</TestProgressProvider>
                    </MobileForestBackground>
                </MotionProvider>
            </body>
        </html>
    )
}
