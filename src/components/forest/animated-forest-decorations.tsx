'use client';

import Image, { type StaticImageData } from 'next/image';

import { fadeOnly, floatingLeaf, gentleSway, particleFloat, popIn } from '@/lib/motion/variants';
import { cn } from '@/lib/utils';

import { type TargetAndTransition, type Variants, m, useReducedMotion } from 'motion/react';

import forestLightParticles from '@/public/assets/mbti/forest-light-particles.png';
import leafMonstera from '@/public/assets/mbti/leaf-monstera.png';
import leafPalm from '@/public/assets/mbti/leaf-palm.png';
import mushroomFlowerCluster from '@/public/assets/mbti/mushroom-flower-cluster.png';
import vineHanging from '@/public/assets/mbti/vine-hanging.png';

import { DECAL_IMAGE_CLASS, DECAL_WRAPPER_CLASS, decalStyle } from './decal';

function desync(base: Variants, animateKey: string, overrides: { delay?: number; duration?: number }): Variants {
	const target = base[animateKey] as TargetAndTransition;
	return {
		...base,
		[animateKey]: {
			...target,
			transition: { ...target.transition, ...overrides },
		},
	};
}

const palmFloat = desync(floatingLeaf, 'float', { delay: 1.7, duration: 6.4 });
const vineSway = desync(gentleSway, 'sway', { delay: 0.9 });

interface AnimatedDecal {
	name: string;
	src: StaticImageData;
	vars: { x: string; y: string; w: string; r: string };
	sizes: string;
	wrapperClassName?: string;
	motionClassName?: string;
	kind: 'idle' | 'entrance';
	variants: Variants;
	initial: string;
	animate: string;
}

const ANIMATED_DECALS: readonly AnimatedDecal[] = [
	{
		name: 'monstera',
		src: leafMonstera,
		vars: { x: '6%', y: '15%', w: 'clamp(4.5rem, 26vw, 10.625rem)', r: '-10deg' },
		sizes: '(min-width: 654px) 10.625rem, 26vw',
		wrapperClassName: 'max-[23.75rem]:w-[clamp(3.75rem,22vw,8.125rem)]',
		kind: 'idle',
		variants: floatingLeaf,
		initial: 'rest',
		animate: 'float',
	},
	{
		name: 'palm',
		src: leafPalm,
		vars: { x: '95%', y: '12%', w: 'clamp(6rem, 32vw, 13.75rem)', r: '-14deg' },
		sizes: '(min-width: 688px) 13.75rem, 32vw',
		wrapperClassName: 'max-[23.75rem]:w-[clamp(5rem,28vw,9.375rem)]',
		kind: 'idle',
		variants: palmFloat,
		initial: 'rest',
		animate: 'float',
	},
	{
		name: 'vine',
		src: vineHanging,
		vars: { x: '97%', y: '24%', w: 'clamp(4.375rem, 22vw, 9.375rem)', r: '0deg' },
		sizes: '(min-width: 682px) 9.375rem, 22vw',
		motionClassName: 'origin-top',
		kind: 'idle',
		variants: vineSway,
		initial: 'rest',
		animate: 'sway',
	},
	{
		name: 'mushroom',
		src: mushroomFlowerCluster,
		vars: { x: '86%', y: '95%', w: 'clamp(3.75rem, 20vw, 8.125rem)', r: '0deg' },
		sizes: '(min-width: 650px) 8.125rem, 20vw',
		kind: 'entrance',
		variants: popIn,
		initial: 'hidden',
		animate: 'visible',
	},
];

const fadeOnlyEntrance: Variants = {
	hidden: { ...(fadeOnly.hidden as TargetAndTransition), scale: 1 },
	visible: { ...(fadeOnly.visible as TargetAndTransition), scale: 1 },
};

const particleStill: Variants = {
	...particleFloat,
	still: { opacity: 0.55, x: 0, y: 0, transition: { duration: 0 } },
};

export function AnimatedForestDecals() {
	const reducedMotion = useReducedMotion();

	return (
		<>
			{ANIMATED_DECALS.map((d) => {
				const entrance = d.kind === 'entrance';
				const variants = entrance && reducedMotion ? fadeOnlyEntrance : d.variants;
				const animate = !entrance && reducedMotion ? d.initial : d.animate;

				return (
					<div
						key={d.name}
						className={cn(DECAL_WRAPPER_CLASS, d.wrapperClassName)}
						style={decalStyle(d.vars)}
					>
						<m.div className={d.motionClassName} variants={variants} initial={d.initial} animate={animate}>
							<Image className={DECAL_IMAGE_CLASS} src={d.src} alt="" quality={50} sizes={d.sizes} />
						</m.div>
					</div>
				);
			})}
		</>
	);
}

export function AnimatedForestParticles() {
	const reducedMotion = useReducedMotion();

	return (
		<div className="pointer-events-none absolute -inset-3">
			<m.div
				className="h-full w-full opacity-55"
				variants={particleStill}
				initial="rest"
				animate={reducedMotion ? 'still' : 'drift'}
			>
				<Image
					className="object-cover object-center select-none"
					src={forestLightParticles}
					alt=""
					fill
					quality={40}
					sizes="100vw"
				/>
			</m.div>
		</div>
	);
}
