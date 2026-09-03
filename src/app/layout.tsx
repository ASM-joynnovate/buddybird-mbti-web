import type { Metadata } from 'next';
import { Jua } from 'next/font/google';

import { AnalyticsBootstrap } from '@/providers/analytics-bootstrap';
import { MotionProvider } from '@/providers/motion-provider';
import { TestProgressProvider } from '@/providers/test-progress-provider';

import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const jua = Jua({
	weight: '400',
	subsets: ['latin'],
	preload: false,
	variable: '--font-jua',
});

export const metadata: Metadata = {
	title: '앵BTI · 버디버드',
	description: '우리 앵무새의 성격은? 12문항으로 알아보는 앵BTI 테스트.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko" className={`${jua.variable} h-full antialiased`}>
			<body className="flex min-h-full flex-col">
				<Toaster richColors expand closeButton />
				<AnalyticsBootstrap />
				<MotionProvider>
					<TestProgressProvider>{children}</TestProgressProvider>
				</MotionProvider>
			</body>
		</html>
	);
}
