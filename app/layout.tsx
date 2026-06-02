import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { TestProgressProvider } from '@/lib/state/test-progress-context'
import './globals.css'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
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
        <html
            lang="ko"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col">
                <TestProgressProvider>{children}</TestProgressProvider>
            </body>
        </html>
    )
}
