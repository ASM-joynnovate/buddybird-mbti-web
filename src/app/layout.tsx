import type { Metadata } from 'next';
import { Jua } from 'next/font/google';

import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_LOCALE, SITE_NAME, SITE_URL } from '@/lib/content/seo';

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

// Site-wide metadata defaults. metadataBase + robots live ONLY here and inherit into
// every route (Next merges shallowly; nested objects are replaced, not deep-merged —
// so robots is never redefined per page). Per-route canonical + Open Graph come from
// pageMetadata() in each page's own metadata export.
export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: DEFAULT_TITLE,
	description: DEFAULT_DESCRIPTION,
	applicationName: SITE_NAME,
	alternates: { canonical: SITE_URL },
	openGraph: {
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		url: SITE_URL,
		siteName: SITE_NAME,
		locale: SITE_LOCALE,
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
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
