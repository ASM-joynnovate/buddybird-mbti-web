'use client';

import type { ReactNode } from 'react';

import { LazyMotion } from 'motion/react';

const loadFeatures = () => import('@/lib/motion/motion-features').then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
	return (
		<LazyMotion features={loadFeatures} strict>
			{children}
		</LazyMotion>
	);
}
