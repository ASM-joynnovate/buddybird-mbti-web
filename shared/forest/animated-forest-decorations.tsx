'use client'

// Client-side animated layers of the PNG forest background (issue #26).
// <MobileForestBackground> stays a Server Component; ONLY the decals that
// actually move ship client JS through these two components:
//
//   <AnimatedForestDecals />     — z1 decal layer: monstera/palm slow float,
//                                  vine sway, mushroom one-shot pop-in
//   <AnimatedForestParticles />  — z3 light-particle layer: opacity pulse +
//                                  micro drift
//
// Motion guardrails (ADR-0006 / issue #26): shared lib/motion variants only,
// transform/opacity only, idle loops 3–7s mirrored, never on the full-screen
// base/ground/canopy PNGs (those stay static in the server wrapper). Under
// prefers-reduced-motion every loop renders fully static and the mushroom
// pop-in degrades to opacity-only (fadeOnly).
//
// Placement transform vs Motion transform: the anchor transform
// (translate(-50%,-50%) rotate(--r), Tailwind utilities on the wrapper div)
// stays on the wrapper; Motion animates the inner img so the two transforms
// never fight over the same element. The wrapper/img class strings mirror the
// static decals in mobile-forest-background.tsx (kept in sync by comment — a
// server module cannot import values from a 'use client' module).
//
// Provider note: these layers rely on the app-wide <MotionProvider> in
// app/layout.tsx, which (since commit 22ab364) mounts ABOVE
// <MobileForestBackground> — m.* elements silently render static without
// LazyMotion context, so that ordering is load-bearing.
import type { CSSProperties } from 'react'
import { m, useReducedMotion, type TargetAndTransition, type Variants } from 'motion/react'
import { fadeOnly, floatingLeaf, gentleSway, particleFloat, popIn } from '@/shared/motion'

const ASSET_BASE = '/assets/mbti'

// Derive a desynchronised copy of a shared idle variant: identical motion
// vocabulary (amplitude/easing/mirror), per-decal delay + duration tweak so
// neighbouring leaves never float in mechanical lockstep. Returns a new object
// (the shared variant is never mutated). Durations stay within the 3–7s band.
function desync(
    base: Variants,
    animateKey: string,
    overrides: { delay?: number; duration?: number },
): Variants {
    const target = base[animateKey] as TargetAndTransition
    return {
        ...base,
        [animateKey]: {
            ...target,
            transition: { ...target.transition, ...overrides },
        },
    }
}

const palmFloat = desync(floatingLeaf, 'float', { delay: 1.7, duration: 6.4 })
const vineSway = desync(gentleSway, 'sway', { delay: 0.9 })

// Mirrors the static-decal classes in mobile-forest-background.tsx.
const DECAL_WRAPPER_CLASS =
    'pointer-events-none absolute top-(--y) left-(--x) w-(--w) -translate-x-1/2 -translate-y-1/2 rotate-(--r) select-none'
const DECAL_IMG_CLASS =
    'block h-auto w-full select-none drop-shadow-[0_6px_12px_rgba(46,36,20,0.16)]'

interface AnimatedDecal {
    name: string
    src: string
    // Same CSS-variable placement contract as the static decals in
    // mobile-forest-background.tsx (anchor %, clamp() width, base rotation).
    vars: { x: string; y: string; w: string; r: string }
    /** Extra wrapper classes (narrow-viewport size overrides). */
    wrapperClassName?: string
    /** Extra img classes (e.g. the vine's hanging pivot). */
    imgClassName?: string
    // 'idle'     — infinite mirrored loop; fully static under reduced motion.
    // 'entrance' — one-shot pop-in on load; opacity-only under reduced motion.
    kind: 'idle' | 'entrance'
    variants: Variants
    initial: string
    animate: string
}

// Only the decals that move (issue #26 list). The static ones (general leaf,
// rock cluster) stay in the Server Component and ship no JS.
const ANIMATED_DECALS: readonly AnimatedDecal[] = [
    {
        name: 'monstera',
        src: `${ASSET_BASE}/leaf-monstera.png`,
        vars: { x: '6%', y: '15%', w: 'clamp(4.5rem, 26vw, 10.625rem)', r: '-10deg' },
        wrapperClassName: 'max-[23.75rem]:w-[clamp(3.75rem,22vw,8.125rem)]',
        kind: 'idle',
        variants: floatingLeaf,
        initial: 'rest',
        animate: 'float',
    },
    {
        name: 'palm',
        src: `${ASSET_BASE}/leaf-palm.png`,
        vars: { x: '95%', y: '12%', w: 'clamp(6rem, 32vw, 13.75rem)', r: '-14deg' },
        wrapperClassName: 'max-[23.75rem]:w-[clamp(5rem,28vw,9.375rem)]',
        kind: 'idle',
        variants: palmFloat,
        initial: 'rest',
        animate: 'float',
    },
    {
        name: 'vine',
        src: `${ASSET_BASE}/vine-hanging.png`,
        vars: { x: '97%', y: '24%', w: 'clamp(4.375rem, 22vw, 9.375rem)', r: '0deg' },
        // Vine sway (gentleSway) pivots from where it hangs, not its center.
        imgClassName: 'origin-top',
        kind: 'idle',
        variants: vineSway,
        initial: 'rest',
        animate: 'sway',
    },
    {
        name: 'mushroom',
        src: `${ASSET_BASE}/mushroom-flower-cluster.png`,
        vars: { x: '86%', y: '95%', w: 'clamp(3.75rem, 20vw, 8.125rem)', r: '0deg' },
        kind: 'entrance',
        variants: popIn,
        initial: 'hidden',
        animate: 'visible',
    },
]

function decalStyle(d: AnimatedDecal): CSSProperties {
    return {
        '--x': d.vars.x,
        '--y': d.vars.y,
        '--w': d.vars.w,
        '--r': d.vars.r,
    } as CSSProperties
}

// Reduced-motion strategy: the SSR markup is always the non-reduced render
// (its initial inline styles, e.g. popIn's scale(0.4), are baked into the
// HTML), and React does NOT patch mismatched style attributes during
// hydration. So instead of swapping to plain <img> (which would leave those
// stale styles in place), every element stays Motion-managed and is simply
// driven to a static target — Motion then actively overwrites whatever the
// SSR markup contained:
//   idle decals   → animate to their 'rest' pose (transform: none), no loop
//   mushroom      → opacity-only fade with scale pinned to 1 (fadeOnlyEntrance)
//   particles     → one static 'still' target at the CSS resting opacity

// fadeOnly + scale pinned to 1: opacity-only pop-in that also corrects the
// SSR popIn initial (scale 0.4) instantly — scale never animates.
const fadeOnlyEntrance: Variants = {
    hidden: { ...(fadeOnly.hidden as TargetAndTransition), scale: 1 },
    visible: { ...(fadeOnly.visible as TargetAndTransition), scale: 1 },
}

// Static particle target for reduced motion: matches the resting opacity
// (opacity-55 on the particle img), zero drift, applied instantly.
const particleStill: Variants = {
    ...particleFloat,
    still: { opacity: 0.55, x: 0, y: 0, transition: { duration: 0 } },
}

export function AnimatedForestDecals() {
    const reducedMotion = useReducedMotion()

    return (
        <>
            {ANIMATED_DECALS.map((d) => {
                const entrance = d.kind === 'entrance'
                // Idle loops are fully disabled under reduced motion (held at
                // the 'rest' pose); the entrance pop-in degrades to
                // opacity-only. Both stay m.img so Motion clears any initial
                // styles baked into the SSR markup.
                const variants = entrance && reducedMotion ? fadeOnlyEntrance : d.variants
                const animate = !entrance && reducedMotion ? d.initial : d.animate

                return (
                    <div
                        key={d.name}
                        className={`${DECAL_WRAPPER_CLASS} ${d.wrapperClassName ?? ''}`}
                        style={decalStyle(d)}
                    >
                        <m.img
                            className={`${DECAL_IMG_CLASS} ${d.imgClassName ?? ''}`}
                            src={d.src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            variants={variants}
                            initial={d.initial}
                            animate={animate}
                        />
                    </div>
                )
            })}
        </>
    )
}

export function AnimatedForestParticles() {
    const reducedMotion = useReducedMotion()

    return (
        <m.img
            className="pointer-events-none absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] object-cover object-center opacity-55 select-none"
            src={`${ASSET_BASE}/forest-light-particles.png`}
            alt=""
            loading="lazy"
            decoding="async"
            variants={particleStill}
            initial="rest"
            animate={reducedMotion ? 'still' : 'drift'}
        />
    )
}
