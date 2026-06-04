// App-wide mobile forest background (PNG) — a single fixed layer behind every
// screen, mounted once in app/layout.tsx so Intro / Test / Result / Dex share one
// forest world. Replaces the former <LeafField> SVG backdrop + the globals.css
// body gradient washes. The container is position:fixed (z-index -1), so the
// forest stays pinned to the viewport and does NOT move on scroll — only the page
// content scrolls above it. Server component: static markup, no JS ships.
//
// Layer order (low → high paint): main base → side decals → canopy / ground
// overlays → light particles → cream legibility veil → page content (normal flow,
// painted above the negative-z layer). DOM order defines paint order, so no
// per-layer z-index is needed inside the container.
//
// Asset note: the design brief also expected a "tree branch" and a "bush cluster"
// PNG; neither exists in the asset set, so both are intentionally omitted (no
// broken paths). Only files present under /public/assets/mbti are referenced.
import type { CSSProperties, ReactNode } from 'react'
import './mobile-forest-background.css'

const ASSET_BASE = '/assets/mbti'

interface Decal {
    name: string
    src: string
    // Percentage anchor (--x/--y), responsive width (--w), rotation (--r) — applied
    // via CSS variables on the shared .forest-decal class. Kept as data so positions
    // stay easy to retune and a future srcset swap touches a single place.
    vars: { x: string; y: string; w: string; r: string }
}

// Only decals whose PNG actually exists. Positioned toward the edges/corners so the
// central content column (headline, cards, CTA) is never crowded.
const DECALS: readonly Decal[] = [
    {
        name: 'monstera',
        src: `${ASSET_BASE}/leaf-monstera.png`,
        vars: { x: '6%', y: '15%', w: 'clamp(72px, 26vw, 170px)', r: '-10deg' },
    },
    {
        name: 'palm',
        src: `${ASSET_BASE}/leaf-palm.png`,
        vars: { x: '95%', y: '12%', w: 'clamp(96px, 32vw, 220px)', r: '-14deg' },
    },
    {
        name: 'vine',
        src: `${ASSET_BASE}/vine-hanging.png`,
        vars: { x: '97%', y: '24%', w: 'clamp(70px, 22vw, 150px)', r: '0deg' },
    },
    {
        name: 'general',
        src: `${ASSET_BASE}/leaf-general.png`,
        vars: { x: '8%', y: '52%', w: 'clamp(44px, 14vw, 96px)', r: '14deg' },
    },
    {
        name: 'rock',
        src: `${ASSET_BASE}/rock-cluster.png`,
        vars: { x: '15%', y: '96%', w: 'clamp(96px, 30vw, 200px)', r: '0deg' },
    },
    {
        name: 'mushroom',
        src: `${ASSET_BASE}/mushroom-flower-cluster.png`,
        vars: { x: '86%', y: '95%', w: 'clamp(60px, 20vw, 130px)', r: '0deg' },
    },
]

export function MobileForestBackground({ children }: { children: ReactNode }) {
    return (
        <>
            <div className="forest-bg" aria-hidden="true">
                {/* z0 — main forest base: covers the viewport (cover, never stretched),
                 * eager + high priority as the largest above-the-fold visual (LCP). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    className="forest-base"
                    src={`${ASSET_BASE}/forest-mobile-base.png`}
                    alt=""
                    fetchPriority="high"
                    decoding="async"
                />

                {/* z1 — side decals (only assets that exist). */}
                {DECALS.map((d) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={d.name}
                        className={`forest-decal forest-decal--${d.name}`}
                        src={d.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={
                            {
                                '--x': d.vars.x,
                                '--y': d.vars.y,
                                '--w': d.vars.w,
                                '--r': d.vars.r,
                            } as CSSProperties
                        }
                    />
                ))}

                {/* z2 — top canopy + bottom ground overlays. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    className="forest-canopy"
                    src={`${ASSET_BASE}/forest-top-canopy.png`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    className="forest-ground"
                    src={`${ASSET_BASE}/forest-bottom-ground.png`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                />

                {/* z3 — subtle light particles. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    className="forest-particles"
                    src={`${ASSET_BASE}/forest-light-particles.png`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                />

                {/* z4 — cream legibility veil (keeps content readable over the forest). */}
                <div className="forest-veil" />
            </div>
            {children}
        </>
    )
}
