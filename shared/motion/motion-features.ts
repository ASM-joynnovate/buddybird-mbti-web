// Async feature bundle for LazyMotion (ADR-0006). Kept in its own module so
// the dynamic import in motion-provider.tsx splits domAnimation (~15KB
// min+gzip: animations, variants, exit, gestures) out of the initial bundle —
// the motion.dev "reduce bundle size" pattern. The default export shape is
// what LazyMotion's async `features` callback expects.
import { domAnimation } from 'motion/react'

export default domAnimation
