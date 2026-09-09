// Single source for SEO / social-share metadata. Holds the site identity copy and
// a per-route Metadata builder that attaches canonical + Open Graph + Twitter Card
// on top of a page's title/description (BB-405).
//
// The production origin is PUBLIC (not a secret) and stable, so it defaults here and
// bakes into the image at build time — no CI secret or env entry required. Override
// it with NEXT_PUBLIC_SITE_URL when a build must point at a different origin (a
// staging/preview host). No trailing slash.
//
// Open Graph / Twitter IMAGES are intentionally omitted until the share-card art
// lands (BB-405 follow-up) — add `images: [...]` in `pageMetadata` then; with
// metadataBase set, a root-absolute path like '/og.png' resolves automatically.
import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://mbti.buddybird.xyz';

// Resolve the origin from the env override, falling back to the default when it is
// blank OR malformed. A bad override (missing scheme, unparseable) must NOT reach the
// `new URL(SITE_URL)` in the root layout: that throws at module load and takes down
// EVERY route (build failure / 500), not just SEO. So validate here and degrade to the
// known-good default instead of crashing.
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
		// Surface the misconfiguration loudly (matches next.config's env warnings).
		console.warn(
			`[seo] NEXT_PUBLIC_SITE_URL="${candidate}" is not a valid http(s) URL — falling back to ${DEFAULT_SITE_URL}. It must include the scheme, e.g. https://example.com`,
		);
		return DEFAULT_SITE_URL;
	}
}

// Normalized production origin, no trailing slash.
export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = '버디버드 앵BTI';
export const SITE_LOCALE = 'ko_KR';

export const DEFAULT_TITLE = '앵BTI · 버디버드';
export const DEFAULT_DESCRIPTION = '우리 앵무새의 성격은? 12문항으로 알아보는 앵BTI 테스트.';

// Absolute URL for a route path. With trailingSlash off, the canonical form has no
// trailing slash — including the home route, which normalizes to the bare origin
// (matching how Next emits canonical/og:url), so the sitemap and canonical agree.
export function absoluteUrl(path: string): string {
	return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

// Indexable routes for the sitemap. Paths mirror the served URLs (no trailing slash).
// /result is intentionally excluded: without its `t` query param it client-redirects
// to home, so a bare /result is not a content page worth submitting for indexing.
export const SEO_ROUTES = [
	{ path: '/', priority: 1, changeFrequency: 'weekly' },
	{ path: '/test', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/species', priority: 0.5, changeFrequency: 'monthly' },
] as const;

export type PageSeo = {
	title: string;
	// Falls back to DEFAULT_DESCRIPTION so every page ships an og:description.
	description?: string;
	// Route path, e.g. '/test'. '/' for the home route.
	path: string;
	// Set false to emit robots noindex for this route (still follow + still shareable:
	// OG/Twitter scrapers ignore robots). Use for personalized/redirecting surfaces.
	index?: boolean;
};

// Build a route's Metadata: title/description + canonical + a COMPLETE Open Graph
// and Twitter object. Completeness matters — Next merges metadata shallowly, so a
// page that sets `openGraph` fully replaces the layout's (no deep merge). robots and
// metadataBase stay layout-only and inherit down, unless a page opts out via `index`.
export function pageMetadata({ title, description, path, index = true }: PageSeo): Metadata {
	const desc = description ?? DEFAULT_DESCRIPTION;
	const canonical = absoluteUrl(path);
	return {
		title,
		description: desc,
		alternates: { canonical },
		...(index ? {} : { robots: { index: false, follow: true } }),
		openGraph: {
			title,
			description: desc,
			url: canonical,
			siteName: SITE_NAME,
			locale: SITE_LOCALE,
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description: desc,
		},
	};
}
