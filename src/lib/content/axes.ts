import type { Axis } from '@/types/mbti';

export interface AxisEnd {
	label: string;
	letter: string;
	color: string;
}

export interface AxisMeta {
	left: AxisEnd;
	right: AxisEnd;
	cssVar: string;
}

export const AXIS_META: Record<Axis, AxisMeta> = {
	EI: {
		left: { label: '인싸앵', letter: 'E', color: '#e8772e' },
		right: { label: '집콕앵', letter: 'I', color: '#3e8fd0' },
		cssVar: 'var(--color-axis-ei)',
	},
	SN: {
		left: { label: '현실앵', letter: 'S', color: '#5b9e3a' },
		right: { label: '구름앵', letter: 'N', color: '#7b3fb5' },
		cssVar: 'var(--color-axis-sn)',
	},
	TF: {
		left: { label: '팩폭앵', letter: 'T', color: '#2e9bb5' },
		right: { label: '말랑앵', letter: 'F', color: '#e86a9e' },
		cssVar: 'var(--color-axis-tf)',
	},
	JP: {
		left: { label: '칼각앵', letter: 'J', color: '#3c7a24' },
		right: { label: '즉흥앵', letter: 'P', color: '#e8b53a' },
		cssVar: 'var(--color-axis-jp)',
	},
};
