import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/content/seo';

// robots.txt: allow everything (no private routes — user data never touches a
// server; photos are processed 100% client-side). Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: '*', allow: '/' },
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL,
	};
}
