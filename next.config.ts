import type { NextConfig } from 'next'

// Firebase config is optional but easy to forget on the deploy host: NEXT_PUBLIC_*
// values are frozen into the bundle at build time, so a build without them ships
// with analytics silently OFF (ADR-0011). Warn loudly, never fail — env-less
// builds (local dev, E2E, CI) are a supported configuration.
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn(
        '[build] NEXT_PUBLIC_FIREBASE_* not set — Firebase analytics will be DISABLED in this build (see docs/adr/0011).',
    )
}

const nextConfig: NextConfig = {
    // Deployed as a Next standalone Node server behind the existing Caddy proxy
    // (see docs/adr/0002). `next build` emits `.next/standalone/server.js`;
    // user data still never touches a server (ADR-0002).
    output: 'standalone',
    // Preserve directory-style URLs (`/test/`, `/result/`) so shared links and
    // existing navigation stay stable across the static→standalone switch.
    trailingSlash: true,
    images: {
        // AVIF first (≈20–30% smaller than WebP for the painterly forest PNGs),
        // WebP fallback. First-hit encode cost is paid once per size/format and
        // then served from the optimizer cache (standalone Node server, ADR-0002).
        formats: ['image/avif', 'image/webp'],
        // Next 16 requires an explicit quality allowlist. 75 is the component
        // default; 65 is the parrot character art (clean flat illustration);
        // 50 is the side decals; 40 is the full-bleed painterly layers
        // (base/canopy/ground/particles) where the soft illustration style +
        // the cream legibility veil hide compression artifacts (Lighthouse
        // image-delivery flagged q60 as still compressible; verified visually
        // at q40).
        qualities: [40, 50, 65, 75],
    },
    // experimental.inlineCss was tried here and REVERTED: with the 88
    // @font-face Jua subsets the page CSS is ~92KB raw, and the experiment
    // embeds it 3× in the document (once in <style>, twice escaped inside the
    // React Flight payload) — a 319KB HTML document that pushed FCP/LCP up
    // instead of down. The render-blocking <link> stylesheet is the cheaper
    // trade (measured: Lighthouse mobile FCP improved when reverted).
}

export default nextConfig
