import type { TypeCode } from '@/types/mbti';

import { getTypeInfo } from './type-infos';

const FALLBACK_COLORS: readonly [string, string] = ['#5b9e3a', '#2e6b2e'];

export function typeColors(code: TypeCode): readonly [string, string] {
	return getTypeInfo(code)?.colors ?? FALLBACK_COLORS;
}

export function typeGradient(code: TypeCode): string {
	const [c1, c2] = typeColors(code);
	return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}
