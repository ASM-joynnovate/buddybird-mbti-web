// Static asset slot rule. Type/carousel/card parrot character images live under
// public/parrots-mbti-charactor/{TYPE}.png, named by the uppercase 4-letter type
// code (e.g. ENFP.png).
//
// Paths are root-absolute strings (not bundler imports) so they resolve identically
// under static export and when drawn onto a <canvas> for the share card. If an image
// is missing, <img onError> falls back to a CSS placeholder so layout (and CLS
// budget) holds.
import type { TypeCode } from '@/lib/mbti';

import { TYPES } from './types';

const PARROT_IMAGE_BASE = '/parrots-mbti-charactor';
export const BRAND_LOGO_SRC = '/brand/buddybird-logo.png';

// Root-absolute path to a type's parrot character image, keyed by the uppercase type code.
export function parrotImageSrc(type: TypeCode): string {
	return `${PARROT_IMAGE_BASE}/${type}.png`;
}

// Carousel order derives from the engine's canonical 16-type map, so it can never
// drift from content/types.ts.
export const CAROUSEL_TYPES: readonly TypeCode[] = Object.keys(TYPES) as TypeCode[];
