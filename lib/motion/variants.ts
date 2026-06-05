// Shared Motion variants for the "cozy forest game" UI pass (issues #19–#27,
// ADR-0006). One module so every surface animates with the same easing/duration
// vocabulary, visually matching the CSS tokens in app/globals.css:
//   easeLeaf   <-> --ease-leaf    cubic-bezier(0.16, 1, 0.3, 1)
//   easeSpring <-> --ease-spring  cubic-bezier(0.34, 1.56, 0.64, 1)
//   durations  <-> --duration-fast / --duration-base / --duration-slow
//
// Bundle convention (ADR-0006): use the lightweight `m` components, NOT the
// full `motion` namespace — features come from the app-wide <MotionProvider>
// (LazyMotion + domAnimation, strict) mounted in app/layout.tsx:
//   import { m } from 'motion/react'  →  <m.div variants={fadeUp} … />
//
// Reduced-motion convention (ADR-0006): components rendering m.* elements
// read `useReducedMotion()` from "motion/react" and (a) swap entrance variants
// for the opacity-only `fadeOnly`, (b) drop `whileTap`/idle-loop props entirely.
// Non-Motion orchestration (carousel auto-advance, test auto-advance timing)
// keeps using lib/hooks/use-reduced-motion.ts — both read the same media query.
//
// Idle loops (floatingLeaf / gentleSway / particleFloat) are DECORATION-ONLY:
// transform/opacity, 3–7s, mirrored repeat — never on full-screen layers and
// never on meaningful content (PRD motion guardrails).
import type { TargetAndTransition, Transition, Variants } from 'motion/react'

/* ── Easing / duration vocabulary (mirror of the CSS tokens) ── */

export const easeLeaf = [0.16, 1, 0.3, 1] as const
export const easeSpring = [0.34, 1.56, 0.64, 1] as const

export const durationFast = 0.16
export const durationBase = 0.26
export const durationSlow = 0.42

/* ── Entrances ── */

// Default entrance: soft rise, leaf easing. Pair children with staggerContainer.
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: easeLeaf },
    },
}

// Parent orchestrator for staggered fadeUp/popIn children.
export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
}

// Springy scale-in for reveals (result code, stamps, badges) — one-shot only.
export const popIn: Variants = {
    hidden: { opacity: 0, scale: 0.4 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: durationSlow, ease: easeSpring },
    },
}

// Reduced-motion fallback: entrances degrade to opacity-only.
export const fadeOnly: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: durationBase } },
}

/* ── Interactions ── */

// Raised game-button press: shrink + sink (the CSS :active state shrinks the
// bottom depth shadow in concert). Pass to `whileTap`; omit under reduced motion.
export const buttonTap: TargetAndTransition = {
    scale: 0.96,
    y: 2,
    transition: { duration: 0.14, ease: easeLeaf },
}

/* ── Sheets / modals (use with AnimatePresence for the exit leg) ── */

export const sheetSlideUp: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: durationSlow, ease: easeSpring },
    },
    exit: {
        opacity: 0,
        y: 24,
        scale: 0.96,
        transition: { duration: durationBase, ease: easeLeaf },
    },
}

/* ── Decorative idle loops (background flourishes only) ── */

const idleLoop = (duration: number): Transition => ({
    duration,
    repeat: Infinity,
    repeatType: 'mirror',
    ease: 'easeInOut',
})

// Slow vertical drift + slight tilt for large leaves (monstera / palm).
export const floatingLeaf: Variants = {
    rest: { y: 0, rotate: 0 },
    float: { y: -10, rotate: 3, transition: idleLoop(5) },
}

// Gentle pendulum sway for hanging vines.
export const gentleSway: Variants = {
    rest: { rotate: 0 },
    sway: { rotate: 2, transition: idleLoop(6) },
}

// Soft opacity pulse + tiny drift for light particles.
export const particleFloat: Variants = {
    rest: { opacity: 0.35, y: 0, x: 0 },
    drift: { opacity: 0.8, y: -8, x: 4, transition: idleLoop(4.5) },
}
