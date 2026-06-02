import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Client-only viral web: ship a fully static bundle (no server runtime).
    // Emits one HTML file per route into `out/` for static hosting.
    output: 'export',
    // Emit `out/test/index.html` (directory-style) so any static file server
    // resolves `/test/` and `/result/` without extension rewriting.
    trailingSlash: true,
}

export default nextConfig
