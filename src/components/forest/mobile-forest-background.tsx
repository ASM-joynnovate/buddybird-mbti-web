import type { ReactNode } from 'react';

import Image, { type StaticImageData } from 'next/image';

import { cn } from '@/lib/utils';

import forestBottomGround from '@/public/assets/mbti/forest-bottom-ground.png';
import forestMobileBase from '@/public/assets/mbti/forest-mobile-base.png';
import forestTopCanopy from '@/public/assets/mbti/forest-top-canopy.png';
import leafGeneral from '@/public/assets/mbti/leaf-general.png';
import rockCluster from '@/public/assets/mbti/rock-cluster.png';

import { AnimatedForestDecals, AnimatedForestParticles } from './animated-forest-decorations';
import { DECAL_IMAGE_CLASS, DECAL_WRAPPER_CLASS, decalStyle } from './decal';

interface Decal {
	name: string;
	src: StaticImageData;
	vars: { x: string; y: string; w: string; r: string };
	sizes: string;
	className?: string;
}

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
];

export function MobileForestBackground({ children }: { children: ReactNode }) {
	return (
		<>
			<div
				className="pointer-events-none fixed inset-0 -z-1 h-dvh min-h-svh overflow-hidden bg-bg"
				aria-hidden="true"
			>
				<Image
					className="object-cover object-center"
					src={forestMobileBase}
					alt=""
					fill
					loading="eager"
					quality={40}
					sizes="100vw"
				/>

				{STATIC_DECALS.map((d) => (
					<div key={d.name} className={cn(DECAL_WRAPPER_CLASS, d.className)} style={decalStyle(d.vars)}>
						<Image className={DECAL_IMAGE_CLASS} src={d.src} alt="" quality={50} sizes={d.sizes} />
					</div>
				))}
				<AnimatedForestDecals />

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

				<AnimatedForestParticles />

				<div
					className="pointer-events-none absolute inset-0
						bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-bg)_14%,transparent)_0%,color-mix(in_srgb,var(--color-bg)_54%,transparent)_28%,color-mix(in_srgb,var(--color-bg)_54%,transparent)_74%,color-mix(in_srgb,var(--color-bg)_18%,transparent)_100%)]"
				/>
			</div>
			{children}
		</>
	);
}
