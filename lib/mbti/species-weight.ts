import type { Choice, Letter } from '@/lib/mbti/types';

export const SPECIES_LIST = [
	'코뉴어',
	'퀘이커',
	'왕관앵무',
	'모란앵무',
	'세네갈앵무',
	'회색앵무',
	'아마존앵무',
	'마카우',
	'사랑앵무',
	'카이큐',
	'코카투',
	'유리앵무',
	'뉴기니아앵무',
	'목도리앵무',
	'기타',
] as const;

export type Species = (typeof SPECIES_LIST)[number];

const SPECIES_WEIGHTS: Record<Species, Partial<Record<Letter, number>>> = {
	코뉴어: { E: 2, N: 1, F: 1, P: 1 },
	퀘이커: { S: 1, T: 1, J: 1 },
	왕관앵무: { I: 1, S: 1, F: 2, J: 1 },
	모란앵무: { E: 1, N: 1, F: 1, P: 1 },
	세네갈앵무: { I: 1, T: 1, J: 1 },
	회색앵무: { I: 1, N: 2, T: 1 },
	아마존앵무: { E: 2, S: 1, P: 1 },
	마카우: { E: 2, F: 1, P: 1 },
	사랑앵무: { E: 1, F: 1, P: 1 },
	카이큐: { E: 2, N: 1, P: 2 },
	코카투: { E: 2, F: 2, P: 1 },
	유리앵무: { I: 1, S: 1, T: 1, P: 1 },
	뉴기니아앵무: { I: 1, S: 1, F: 1, J: 1 },
	목도리앵무: { E: 1, N: 1, T: 1, P: 1 },
	기타: {},
};

// Returns a synthetic Choice to append to the answers before computeResult.
// Returns null for '기타' (no bias) or any species with an empty weights map.
export function speciesOffsetChoice(species: Species): Choice | null {
	const weights = SPECIES_WEIGHTS[species];
	if (Object.keys(weights).length === 0) return null;
	return { id: 'species-offset', label: species, weights };
}
