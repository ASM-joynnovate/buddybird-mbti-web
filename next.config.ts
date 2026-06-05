import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Deployed as a Next standalone Node server behind the existing Caddy proxy
    // (see docs/adr/0002). `next build` emits `.next/standalone/server.js`;
    // user data still never touches a server (ADR-0002).
    output: 'standalone',
    // Preserve directory-style URLs (`/test/`, `/result/`) so shared links and
    // existing navigation stay stable across the static→standalone switch.
    trailingSlash: true,
}

export default nextConfig
