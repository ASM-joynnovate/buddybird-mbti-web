export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

export const CARD_W = 885;
export const CARD_X = (CANVAS_W - CARD_W) / 2;
export const CARD_Y = 310;
export const CARD_PAD = 34;
export const CARD_RADIUS = 22;
export const CARD_DEPTH = 19;
export const CARD_ROTATE = (-3 * Math.PI) / 180;
export const CARD_BG = '#ffffff';
export const CARD_DEPTH_COLOR = '#e7a06a';

export const PHOTO_INNER = CARD_W - CARD_PAD * 2;
export const PHOTO_H = Math.round((PHOTO_INNER * 4) / 5);
export const PHOTO_R = 30;
export const DUO_GAP = 14;

export const CAP_TOP_PAD = 30;
export const CAP_CODE_SIZE = 105;
export const CAP_NAME_GAP = 18;
export const CAP_NAME_SIZE = 47;
export const CAP_BOTTOM_PAD = 44;

export const TAPE_H = 90;
export const TAPE_FONT_SIZE = 50;
export const BRAND_TAPE = { label: 'Buddybird', x: CARD_X + 40, w: 375, rotate: -6 } as const;
export const SERVICE_TAPE = { label: '앵BTI', x: CARD_X + CARD_W - 52 - 285, w: 285, rotate: 6 } as const;

export const INVITE_LABEL = '우리 앵무새도 해 보기';
export const INVITE_URL = 'mbti.buddybird.xyz';
export const INVITE_LABEL_SIZE = 43;
export const INVITE_URL_SIZE = 64;
export const INVITE_LABEL_Y = 1395;
export const INVITE_URL_Y = 1480;

export const CREDIT_PREFIX = 'by';
export const CREDIT_BRAND = 'Buddybird';
export const CREDIT_SUFFIX = '· 앵무새 말 가르치기';
export const CREDIT_SIZE = 41;
export const CREDIT_ICON = 68;
export const CREDIT_ICON_R = 19;
export const CREDIT_GAP = 15;
export const CREDIT_CY = 1640;

export const FONT_DISPLAY = '"Jua", system-ui, sans-serif';

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
export const BRAND_RED = '#e0261b';

export const PET_PLACEHOLDER_BG = '#ece1cb';
