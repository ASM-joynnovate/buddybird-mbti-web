'use client';

// App-wide Motion feature provider (ADR-0006). The bundle-size convention for
// this codebase is LazyMotion + the lightweight `m` components instead of the
// full `motion` namespace: domAnimation (animations, variants, exit, gestures)
// is loaded ASYNC after first render (motion-features.ts), so the feature
// bundle never blocks hydration / LCP paint — the SSR markup renders static,
// then entrance animations start the moment the chunk resolves (per the
// motion.dev "reduce bundle size" docs). `strict` makes any accidental
// `motion.*` usage throw in development so the full bundle never sneaks in.
//
//   import { m, useReducedMotion } from 'motion/react'   // ✅ m.div / m.button
//   import { motion } from 'motion/react'                // ❌ throws under strict
//
// Children stay server-renderable — this wrapper only provides client context.
import type { ReactNode } from 'react';

import { LazyMotion } from 'motion/react';

const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
	return (
		<LazyMotion features={loadFeatures} strict>
			{children}
		</LazyMotion>
	);
}
