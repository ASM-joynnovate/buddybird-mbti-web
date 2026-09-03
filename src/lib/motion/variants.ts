import type { TargetAndTransition, Transition, Variants } from 'motion/react';

export const easeLeaf = [0.16, 1, 0.3, 1] as const;
export const easeSpring = [0.34, 1.56, 0.64, 1] as const;

export const durationFast = 0.16;
export const durationBase = 0.26;
const durationSlow = 0.42;

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: easeLeaf },
	},
};

export const staggerContainer: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08, delayChildren: 0.04 },
	},
};

export const popIn: Variants = {
	hidden: { opacity: 0, scale: 0.4 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: durationSlow, ease: easeSpring },
	},
};

export const fadeOnly: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: durationBase } },
};

export const buttonTap: TargetAndTransition = {
	scale: 0.96,
	y: 2,
	transition: { duration: 0.14, ease: easeLeaf },
};

export const cardTap: TargetAndTransition = {
	scale: 0.98,
	transition: { duration: 0.2, ease: easeLeaf },
};

const idleLoop = (duration: number): Transition => ({
	duration,
	repeat: Infinity,
	repeatType: 'mirror',
	ease: 'easeInOut',
});

export const floatingLeaf: Variants = {
	rest: { y: 0, rotate: 0 },
	float: { y: -10, rotate: 3, transition: idleLoop(5) },
};

export const gentleSway: Variants = {
	rest: { rotate: 0 },
	sway: { rotate: 2, transition: idleLoop(6) },
};

export const particleFloat: Variants = {
	rest: { opacity: 0.35, y: 0, x: 0 },
	drift: { opacity: 0.8, y: -8, x: 4, transition: idleLoop(4.5) },
};
