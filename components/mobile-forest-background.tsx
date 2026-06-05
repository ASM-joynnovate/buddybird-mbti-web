// App-wide mobile forest background (PNG) — a single fixed layer behind every
// screen, mounted once in app/layout.tsx so Intro / Test / Result / Dex share one
// forest world. Replaces the former <LeafField> SVG backdrop + the globals.css
// body gradient washes. The container is position:fixed (z-index -1), so the
// forest stays pinned to the viewport and does NOT move on scroll — only the page
// content scrolls above it.
//
// Server/client split (issue #26): this wrapper stays a Server Component — the
// full-screen PNGs (base / canopy / ground) and the static decals (general leaf,
// rock) render with zero client JS. Only the decals that actually move are
// delegated to the client components in animated-forest-decorations.tsx
// (monstera/palm float, vine sway, mushroom pop-in, particle pulse), keeping the
// idle motion restrained and the big layers permanently static.
//
// Layer order (low → high paint): main base → side decals (static + animated) →
// canopy / ground overlays → light particles → cream legibility veil → page
// content (normal flow, painted above the negative-z layer). DOM order defines
// paint order, so no per-layer z-index is needed inside the container.
//
// Asset note: the design brief also expected a "tree branch" and a "bush cluster"
// PNG; neither exists in the asset set, so both are intentionally omitted (no
// broken paths). Only files present under /public/assets/mbti are referenced.
import type { CSSProperties, ReactNode } from 'react'
import { AnimatedForestDecals, AnimatedForestParticles } from './animated-forest-decorations'
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

// Static decals only (never animated — issue #26 keeps rock/ground-level anchors
// still). The moving decals live in animated-forest-decorations.tsx. Positioned
// toward the edges/corners so the central content column (headline, cards, CTA)
// is never crowded.
const STATIC_DECALS: readonly Decal[] = [
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
]

export function MobileForestBackground({ children }: { children: ReactNode }) {
    return (
        <>
            <div className="forest-bg" aria-hidden="true">
                {/* z0 — main forest base: covers the viewport (cover, never stretched),
                 * eager + high priority as the largest above-the-fold visual (LCP).
                 * Always static (full-screen PNG — never animated). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    className="forest-base"
                    src={`${ASSET_BASE}/forest-mobile-base.png`}
                    alt=""
                    fetchPriority="high"
                    decoding="async"
                />

                {/* z1 — side decals: static ones here (server-rendered, no JS),
                 * animated ones via the client component below (same layer). */}
                {STATIC_DECALS.map((d) => (
                    <div
                        key={d.name}
                        className={`forest-decal forest-decal--${d.name}`}
                        style={
                            {
                                '--x': d.vars.x,
                                '--y': d.vars.y,
                                '--w': d.vars.w,
                                '--r': d.vars.r,
                            } as CSSProperties
                        }
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="forest-decal__img"
                            src={d.src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                ))}
                <AnimatedForestDecals />

                {/* z2 — top canopy + bottom ground overlays (static). */}
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

                {/* z3 — subtle light particles (opacity pulse + micro drift). */}
                <AnimatedForestParticles />

                {/* z4 — cream legibility veil (keeps content readable over the forest). */}
                <div className="forest-veil" />
            </div>
            {children}
        </>
    )
}
