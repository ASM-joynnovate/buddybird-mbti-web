import type { Locale } from './locale';

const EN_PREFIX = '/en';

// Korean owns the locale-less URLs; English is also public under `/en`.
export function localizedPath(path: string, locale: Locale): string {
	if (locale !== 'en') return path;
	return path === '/' ? EN_PREFIX : `${EN_PREFIX}${path}`;
}

// Keeps a visitor who entered through a public `/en` URL on `/en` URLs. Read at navigation time,
// not during render: prerendered HTML is shared between `/en/test` and a rewritten `/test`.
export function currentLocalePath(path: string): string {
	const { pathname } = window.location;
	const underEn = pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`);
	return underEn ? localizedPath(path, 'en') : path;
}
