import type { Metadata } from 'next';
import localFont from 'next/font/local';

import {
	DEFAULT_DESCRIPTION,
	DEFAULT_TITLE,
	SITE_LOCALE,
	SITE_NAME,
	SITE_URL,
	SOCIAL_IMAGES,
	absoluteUrl,
} from '@/lib/content/seo';
import { localizedPath } from '@/lib/i18n/path';
import { getLocale } from '@/lib/i18n/server';
import { translator } from '@/lib/i18n/translate';

import '@/app/globals.css';
import { AnalyticsBootstrap } from '@/providers/analytics-bootstrap';
import { LocaleProvider } from '@/providers/locale-provider';
import { MotionProvider } from '@/providers/motion-provider';
import { TestProgressProvider } from '@/providers/test-progress-provider';

import { Toaster } from '@/components/ui/sonner';

// 소스에서 쓰는 글자만 담은 서브셋. 문구를 추가하면 `node scripts/subset-display-font.mjs`로 다시 생성한다.
const jua = localFont({
	src: '../fonts/jua-subset.woff2',
	weight: '400',
	display: 'swap',
	preload: false,
	variable: '--font-jua',
});

export const dynamicParams = false;

export function generateStaticParams() {
	return [{ locale: 'ko' }, { locale: 'en' }];
}

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = translator(locale);
	const images = locale === 'en' ? [SOCIAL_IMAGES[1]] : SOCIAL_IMAGES;
	return {
		metadataBase: new URL(SITE_URL),
		title: t(DEFAULT_TITLE),
		description: t(DEFAULT_DESCRIPTION),
		applicationName: t(SITE_NAME),
		openGraph: {
			title: t(DEFAULT_TITLE),
			description: t(DEFAULT_DESCRIPTION),
			url: absoluteUrl(localizedPath('/', locale)),
			siteName: t(SITE_NAME),
			locale: locale === 'en' ? 'en_US' : SITE_LOCALE,
			type: 'website',
			images,
		},
		twitter: {
			card: 'summary_large_image',
			title: t(DEFAULT_TITLE),
			description: t(DEFAULT_DESCRIPTION),
			images,
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
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	return (
		<html lang={locale} className={`${jua.variable} h-full antialiased`}>
			<body className="flex min-h-full flex-col">
				<LocaleProvider locale={locale}>
					<Toaster richColors expand closeButton />
					<AnalyticsBootstrap />
					<MotionProvider>
						<TestProgressProvider>{children}</TestProgressProvider>
					</MotionProvider>
				</LocaleProvider>
			</body>
		</html>
	);
}
