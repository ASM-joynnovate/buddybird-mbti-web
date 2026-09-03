import type { TypeCode } from '@/types/mbti';

export type TemperamentGroup = 'Analysts' | 'Diplomats' | 'Sentinels' | 'Explorers';

export function temperamentGroup(type: TypeCode): TemperamentGroup {
	const sn = type[1];
	const tf = type[2];
	const jp = type[3];

	if (sn === 'N') {
		return tf === 'T' ? 'Analysts' : 'Diplomats';
	}
	return jp === 'J' ? 'Sentinels' : 'Explorers';
}

export const GROUP_CSS_VAR: Record<TemperamentGroup, string> = {
	Analysts: 'var(--color-faction-analyst)',
	Diplomats: 'var(--color-faction-diplomat)',
	Sentinels: 'var(--color-faction-sentinel)',
	Explorers: 'var(--color-faction-explorer)',
};
