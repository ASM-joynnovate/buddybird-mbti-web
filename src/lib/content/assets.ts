import type { TypeCode } from '@/types/mbti';

import { TYPES } from './type-infos';

const PARROT_IMAGE_BASE = '/parrots-mbti-charactor';
export function parrotImageSrc(type: TypeCode): string {
	return `${PARROT_IMAGE_BASE}/${type}.png`;
}

export const CAROUSEL_TYPES: readonly TypeCode[] = Object.keys(TYPES) as TypeCode[];
