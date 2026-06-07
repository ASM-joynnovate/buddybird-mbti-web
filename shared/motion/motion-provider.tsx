'use client'

// App-wide Motion feature provider (ADR-0006). The bundle-size convention for
// this codebase is LazyMotion + the lightweight `m` components instead of the
// full `motion` namespace: domAnimation (animations, variants, exit, gestures)
// is loaded synchronously here ONCE, and `strict` makes any accidental
// `motion.*` usage throw in development so the full bundle never sneaks in.
//
//   import { m, useReducedMotion } from 'motion/react'   // ✅ m.div / m.button
//   import { motion } from 'motion/react'                // ❌ throws under strict
//
// Children stay server-renderable — this wrapper only provides client context.
import type { ReactNode } from 'react'
import { domAnimation, LazyMotion } from 'motion/react'

export function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <LazyMotion features={domAnimation} strict>
            {children}
        </LazyMotion>
    )
}
