export const CARD_SIZE = 1080;

export const CARD_W = 760;
export const CARD_X = (CARD_SIZE - CARD_W) / 2;
export const CARD_PAD = 30;
export const CARD_RADIUS = 12;
export const CARD_ROTATE = (-2.5 * Math.PI) / 180;
export const CARD_BG = '#fffdf8';

export const PHOTO_INNER = CARD_W - CARD_PAD * 2;
export const SOLO_PHOTO_H = 560;
export const SOLO_PHOTO_R = 16;
export const DUO_PHOTO_H = 460;
export const DUO_PHOTO_R = 14;
export const DUO_GAP = 14;

export const CAP_TOP_PAD = 30;
export const CAP_CODE_SIZE = 80;
export const CAP_NAME_SIZE = 40;
export const CAP_TAG_SIZE = 28;
export const CAP_TAG_LINE = 40;
export const CAP_BOTTOM_PAD = 36;

export const FONT_DISPLAY = '"Jua", system-ui, sans-serif';
export const FONT_BODY = '"Noto Sans KR", system-ui, sans-serif';

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

export const PET_PLACEHOLDER_BG = '#ece1cb';
