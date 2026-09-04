import type { MetadataRoute } from 'next';

import { SEO_ROUTES, absoluteUrl } from '@/lib/content/seo';

// XML sitemap for /sitemap.xml. Paths carry no trailing slash to match the served
// URLs (trailingSlash is off in next.config).
export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();
	return SEO_ROUTES.map((route) => ({
		url: absoluteUrl(route.path),
		lastModified,
		changeFrequency: route.changeFrequency,
		priority: route.priority,
	}));
}
