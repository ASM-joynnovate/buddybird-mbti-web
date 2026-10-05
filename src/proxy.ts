import { type NextRequest, NextResponse, userAgent } from 'next/server';

import { localeFromCountry } from '@/lib/i18n/locale';

// Each page is prerendered per locale under `/[locale]`. On the locale-less URLs the viewer's
// country selects which one is served, except for crawlers: they always get Korean there, so
// search engines index Korean at `/…` and English at the public `/en/…` URLs.
export function proxy(request: NextRequest) {
	const url = request.nextUrl.clone();
	const locale = userAgent(request).isBot
		? 'ko'
		: localeFromCountry(request.headers.get('cloudfront-viewer-country'));
	url.pathname = `/${locale}${url.pathname === '/' ? '' : url.pathname}`;
	return NextResponse.rewrite(url);
}

export const config = {
	matcher: ['/', '/species', '/test', '/result'],
};
