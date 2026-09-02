// Share-card geometry (design handoff: share-cards.jsx Design B "polaroid
// scrapbook", square 1080x1080). A slightly tilted white polaroid card on warm
// paper — one photo (character) or two (my parrot -> character, before->after) +
// two washi tapes + a round brand stamp + caption (code/name/tagline). Coordinates
// are card pixels (1:1, no dpr scaling) so every viewer gets a byte-identical image.

export const CARD_SIZE = 1080;

// Card (polaroid) frame.
export const CARD_W = 760;
export const CARD_X = (CARD_SIZE - CARD_W) / 2;
export const CARD_PAD = 30;
export const CARD_RADIUS = 12;
export const CARD_ROTATE = (-2.5 * Math.PI) / 180;
export const CARD_BG = '#fffdf8';

// Photo windows.
export const PHOTO_INNER = CARD_W - CARD_PAD * 2; // 700
export const SOLO_PHOTO_H = 560;
export const SOLO_PHOTO_R = 16;
export const DUO_PHOTO_H = 460;
export const DUO_PHOTO_R = 14;
export const DUO_GAP = 14;

// Caption rhythm (below the photo window).
export const CAP_TOP_PAD = 30;
export const CAP_CODE_SIZE = 80;
export const CAP_NAME_SIZE = 40;
export const CAP_TAG_SIZE = 28;
export const CAP_TAG_LINE = 40;
export const CAP_BOTTOM_PAD = 36;

// Caption fonts (canvas literals mirroring the on-screen ResultPolaroid).
export const FONT_DISPLAY = '"Jua", system-ui, sans-serif';
export const FONT_BODY = '"Noto Sans KR", system-ui, sans-serif';

// Paper background / ink colors (canvas literals of the DESIGN.md tokens).
export const PAPER_STOPS: ReadonlyArray<[number, string]> = [
	[0, '#fff7e3'],
	[0.6, '#f3e6c9'],
	[1, '#ecdcbb'],
];
export const PAPER_FALLBACK = '#f3e6c9';

export const INK = '#2a2118';
export const INK_MUTED = '#6b6150';
export const PRIMARY = '#e8772e';
export const PRIMARY_ACTIVE = '#a84e16';
export const GOLD = '#e8b53a';

// Character photo-window gradient fallback (when the type has no colors).
export const CHAR_GRAD_FALLBACK: [string, string] = ['#5b9e3a', '#2e6b2e'];

// Empty pet-slot background (duo never falls through without a photo, but guard).
export const PET_PLACEHOLDER_BG = '#ece1cb';
