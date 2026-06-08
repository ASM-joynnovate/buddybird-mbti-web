// App-wide mobile forest background (PNG) — a single fixed layer behind every
// screen, mounted once in app/layout.tsx so Intro / Test / Result share one
// forest world. The container is position:fixed (z-index -1), so the forest
// stays pinned to the viewport and does NOT move on scroll — only the page
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
// Decal placement contract: percentage anchor (--x/--y), clamp() width (--w),
// rotation (--r) as inline CSS variables consumed by the Tailwind `(--var)`
// shorthand — identical classes live in animated-forest-decorations.tsx (kept
// in sync by comment; a server module cannot import values from a 'use client'
// module).
import type { CSSProperties, ReactNode } from 'react'
import Image, { type StaticImageData } from 'next/image'
// Static imports give next/image the intrinsic dimensions, so the optimizer
// serves resized WebP/AVIF (the base PNG alone is ~1.8MB at source).
import forestBottomGround from '@/public/assets/mbti/forest-bottom-ground.png'
import forestMobileBase from '@/public/assets/mbti/forest-mobile-base.png'
import forestTopCanopy from '@/public/assets/mbti/forest-top-canopy.png'
import leafGeneral from '@/public/assets/mbti/leaf-general.png'
import rockCluster from '@/public/assets/mbti/rock-cluster.png'
import { AnimatedForestDecals, AnimatedForestParticles } from './animated-forest-decorations'

interface Decal {
    name: string
    src: StaticImageData
    vars: { x: string; y: string; w: string; r: string }
    /** Rendered width hint for the responsive srcset — mirrors the live
     * clamp() value (vw term below the clamp ceiling, fixed max above it) so
     * the browser never downloads a srcset step it cannot display. */
    sizes: string
    /** Extra wrapper classes (e.g. narrow-viewport hiding). */
    className?: string
}

// Static decals only (never animated — issue #26 keeps rock/ground-level anchors
// still). The moving decals live in animated-forest-decorations.tsx. Positioned
// toward the edges/corners so the central content column (headline, cards, CTA)
// is never crowded; the low-priority general leaf drops out under 380px.
const STATIC_DECALS: readonly Decal[] = [
    {
        name: 'general',
        src: leafGeneral,
        vars: { x: '8%', y: '52%', w: 'clamp(2.75rem, 14vw, 6rem)', r: '14deg' },
        sizes: '(min-width: 686px) 6rem, 14vw',
        className: 'max-[23.75rem]:hidden',
    },
    {
        name: 'rock',
        src: rockCluster,
        vars: { x: '15%', y: '96%', w: 'clamp(6rem, 30vw, 12.5rem)', r: '0deg' },
        sizes: '(min-width: 667px) 12.5rem, 30vw',
    },
]

export function MobileForestBackground({ children }: { children: ReactNode }) {
    return (
        <>
            {/* Fallback world tone behind the PNGs while they load (bg-bg): warm
             * cream — no white flash. svh/dvh keep the box correct across mobile
             * browser chrome changes. pointer-events-none is belt-and-suspenders
             * (the layer already sits behind everything at z -1). */}
            <div
                className="pointer-events-none fixed inset-0 -z-1 h-dvh min-h-svh overflow-hidden bg-bg"
                aria-hidden="true"
            >
                {/* z0 — main forest base: covers the viewport (cover, never stretched),
                 * preload (Next 16 replacement for the deprecated `priority`) as the
                 * largest above-the-fold visual (LCP). Always static (never animated).
                 * quality 40: the soft illustration + cream veil hide artifacts. */}
                <Image
                    className="object-cover object-center"
                    src={forestMobileBase}
                    alt=""
                    fill
                    preload
                    quality={40}
                    sizes="100vw"
                />

                {/* z1 — side decals: static ones here (server-rendered, no JS),
                 * animated ones via the client component below (same layer). */}
                {STATIC_DECALS.map((d) => (
                    <div
                        key={d.name}
                        className={`pointer-events-none absolute top-(--y) left-(--x) w-(--w) -translate-x-1/2 -translate-y-1/2 rotate-(--r) select-none ${d.className ?? ''}`}
                        style={
                            {
                                '--x': d.vars.x,
                                '--y': d.vars.y,
                                '--w': d.vars.w,
                                '--r': d.vars.r,
                            } as CSSProperties
                        }
                    >
                        <Image
                            className="block h-auto w-full drop-shadow-[0_6px_12px_rgba(46,36,20,0.16)] select-none"
                            src={d.src}
                            alt=""
                            quality={50}
                            sizes={d.sizes}
                        />
                    </div>
                ))}
                <AnimatedForestDecals />

                {/* z2 — top canopy + bottom ground overlays (static). quality 40
                 * like the base — full-width painterly layers. The canopy is the
                 * page's LCP element (the full-viewport base is excluded as a
                 * background by the LCP heuristic): eager + fetchpriority=high.
                 * The ground overlay stays default-lazy ON PURPOSE — in Next 16
                 * every non-lazy <Image> is promoted to a <link rel=preload> in
                 * <head>, and those preloads share bandwidth with the LCP canopy
                 * on slow connections. Lazy-but-in-viewport images still load in
                 * the first wave right after layout (~100ms later), which a
                 * decorative overlay can afford. */}
                <Image
                    className="pointer-events-none absolute top-0 left-0 h-auto w-full select-none"
                    src={forestTopCanopy}
                    alt=""
                    loading="eager"
                    fetchPriority="high"
                    quality={40}
                    sizes="100vw"
                />
                <Image
                    className="pointer-events-none absolute bottom-0 left-0 h-auto w-full select-none"
                    src={forestBottomGround}
                    alt=""
                    quality={40}
                    sizes="100vw"
                />

                {/* z3 — subtle light particles (opacity pulse + micro drift). */}
                <AnimatedForestParticles />

                {/* z4 — cream legibility veil: a vertical wash strongest through the
                 * central content band, lighter at the very top + bottom so canopy
                 * and ground stay visible. color-mix alpha is required — a veil
                 * over a photo has no opaque mix target. */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-bg)_14%,transparent)_0%,color-mix(in_srgb,var(--color-bg)_54%,transparent)_28%,color-mix(in_srgb,var(--color-bg)_54%,transparent)_74%,color-mix(in_srgb,var(--color-bg)_18%,transparent)_100%)]" />
            </div>
            {children}
        </>
    )
}
