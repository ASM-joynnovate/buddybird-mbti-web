import type { MetadataRoute } from 'next';

import { SEO_ROUTES, absoluteUrl, languageAlternates } from '@/lib/content/seo';
import { localizedPath } from '@/lib/i18n/path';

// XML sitemap for /sitemap.xml. Paths carry no trailing slash to match the served
// URLs (trailingSlash is off in next.config).
export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();
	return SEO_ROUTES.flatMap((route) =>
		(['ko', 'en'] as const).map((locale) => ({
			url: absoluteUrl(localizedPath(route.path, locale)),
			lastModified,
			changeFrequency: route.changeFrequency,
			priority: route.priority,
			alternates: { languages: languageAlternates(route.path) },
		})),
	);
}
