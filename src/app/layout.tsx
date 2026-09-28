import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_LOCALE, SITE_NAME, SITE_URL, SOCIAL_IMAGES } from '@/lib/content/seo';

import { AnalyticsBootstrap } from '@/providers/analytics-bootstrap';
import { MotionProvider } from '@/providers/motion-provider';
import { TestProgressProvider } from '@/providers/test-progress-provider';

import { Toaster } from '@/components/ui/sonner';

import './globals.css';

// 소스에서 쓰는 글자만 담은 서브셋. 문구를 추가하면 `node scripts/subset-display-font.mjs`로 다시 생성한다.
const jua = localFont({
	src: './fonts/jua-subset.woff2',
	weight: '400',
	display: 'swap',
	preload: false,
	variable: '--font-jua',
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: DEFAULT_TITLE,
	description: DEFAULT_DESCRIPTION,
	applicationName: SITE_NAME,
	openGraph: {
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		url: SITE_URL,
		siteName: SITE_NAME,
		locale: SITE_LOCALE,
		type: 'website',
		images: SOCIAL_IMAGES,
	},
	twitter: {
		card: 'summary_large_image',
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		images: SOCIAL_IMAGES,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1,
		},
	},
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
