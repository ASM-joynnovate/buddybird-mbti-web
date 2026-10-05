import type { Metadata } from 'next';

import type { Locale } from '@/lib/i18n/locale';
import { localizedPath } from '@/lib/i18n/path';
import { translator } from '@/lib/i18n/translate';

const DEFAULT_SITE_URL = 'https://mbti.buddybird.xyz';

function resolveSiteUrl(): string {
	const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	const raw = candidate && candidate.length > 0 ? candidate : DEFAULT_SITE_URL;
	try {
		const { protocol } = new URL(raw);
		if (protocol !== 'https:' && protocol !== 'http:') {
			throw new Error(`unsupported protocol: ${protocol}`);
		}
		return raw.replace(/\/+$/, '');
	} catch {
		console.warn(
			`[seo] NEXT_PUBLIC_SITE_URL="${candidate}" is not a valid http(s) URL — falling back to ${DEFAULT_SITE_URL}. It must include the scheme, e.g. https://example.com`,
		);
		return DEFAULT_SITE_URL;
	}
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = '버디버드 앵BTI';
export const SITE_LOCALE = 'ko_KR';

export const DEFAULT_TITLE = '앵BTI · 버디버드';
export const DEFAULT_DESCRIPTION = '우리 앵무새의 성격은? 12문항으로 알아보는 앵BTI 테스트.';

export const SOCIAL_IMAGES = [
	{
		url: '/assets/og/aengbti-og-1200x630.png',
		width: 1200,
		height: 630,
		type: 'image/png',
		alt: '우리 앵무새 진짜 성격은? 앵BTI',
	},
	{
		url: '/assets/og/aengbti-og-en-1200x630.png',
		width: 1200,
		height: 630,
		type: 'image/png',
		alt: "What's your parrot's true personality? Parrot MBTI",
	},
];

export function absoluteUrl(path: string): string {
	return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

export function languageAlternates(path: string) {
	const ko = absoluteUrl(localizedPath(path, 'ko'));
	return { ko, en: absoluteUrl(localizedPath(path, 'en')), 'x-default': ko };
}

export const SEO_ROUTES = [
	{ path: '/', priority: 1, changeFrequency: 'weekly' },
	{ path: '/test', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/species', priority: 0.5, changeFrequency: 'monthly' },
] as const;

export type PageSeo = {
	title: string;
	description?: string;
	path: string;
	index?: boolean;
};

export function pageMetadata({ title, description, path, index = true }: PageSeo, locale: Locale = 'ko'): Metadata {
	const t = translator(locale);
	title = t(title);
	const desc = t(description ?? DEFAULT_DESCRIPTION);
	const images = locale === 'en' ? [SOCIAL_IMAGES[1]] : SOCIAL_IMAGES;
	const canonical = absoluteUrl(localizedPath(path, locale));
	return {
		title,
		description: desc,
		alternates: { canonical, ...(index ? { languages: languageAlternates(path) } : {}) },
		...(index ? {} : { robots: { index: false, follow: true } }),
		openGraph: {
			title,
			description: desc,
			url: canonical,
			siteName: t(SITE_NAME),
			locale: locale === 'en' ? 'en_US' : SITE_LOCALE,
			type: 'website',
			images,
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description: desc,
			images,
		},
	};
}
