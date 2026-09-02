// Per-type identity gradient + raw color access ("동화숲 월드", ADR-0002). Each of
// the 16 types owns a 2-stop gradient (TypeInfo.colors) that is its primary visual
// identity across the result hero, dex cards, type modal, and (later) the share card.
//
// `typeGradient` returns a CSS linear-gradient string to assign to an inline
// `--type-grad` custom property. `typeColors` returns the raw hex pair for Canvas
// (the share card), which cannot read CSS variables. Both fall back to the
// foliage-green base for an unknown code so callers never get an undefined value.
import type { TypeCode } from '@/lib/mbti';

import { getTypeInfo } from './types';

const FALLBACK_COLORS: readonly [string, string] = ['#5b9e3a', '#2e6b2e'];

// Raw 2-stop hex pair for a type — for Canvas or other programmatic use.
export function typeColors(code: TypeCode): readonly [string, string] {
	return getTypeInfo(code)?.colors ?? FALLBACK_COLORS;
}

// CSS linear-gradient (135°) string for a type — assign to an inline `--type-grad`.
export function typeGradient(code: TypeCode): string {
	const [c1, c2] = typeColors(code);
	return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}
