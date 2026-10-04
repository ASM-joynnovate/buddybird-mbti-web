import type { TypeCode } from '@/types/mbti';

import { drawCover, loadFonts, roundRectPath } from './canvas-utils';
import {
	BRAND_RED,
	BRAND_TAPE,
	CANVAS_H,
	CANVAS_W,
	CAP_BOTTOM_PAD,
	CAP_CODE_SIZE,
	CAP_NAME_GAP,
	CAP_NAME_SIZE,
	CAP_TOP_PAD,
	CARD_BG,
	CARD_DEPTH,
	CARD_DEPTH_COLOR,
	CARD_PAD,
	CARD_RADIUS,
	CARD_ROTATE,
	CARD_W,
	CARD_X,
	CARD_Y,
	CREDIT_BRAND,
	CREDIT_CY,
	CREDIT_GAP,
	CREDIT_ICON,
	CREDIT_ICON_R,
	CREDIT_PREFIX,
	CREDIT_SIZE,
	CREDIT_SUFFIX,
	DUO_GAP,
	FONT_DISPLAY,
	GOLD,
	INK,
	INK_MUTED,
	INVITE_LABEL,
	INVITE_LABEL_SIZE,
	INVITE_LABEL_Y,
	INVITE_URL,
	INVITE_URL_SIZE,
	INVITE_URL_Y,
	PHOTO_H,
	PHOTO_INNER,
	PHOTO_R,
	PRIMARY,
	PRIMARY_ACTIVE,
	SERVICE_TAPE,
	TAPE_FONT_SIZE,
	TAPE_H,
} from './card-layout';
import { drawCharWindow, drawPetWindow, drawTape, paintPaper } from './card-parts';

interface ComposeCardInput {
	type: TypeCode;
	typeName: string;
	photo: HTMLImageElement | null;
	isGenerated: boolean;
	character: HTMLImageElement | null;
	colors: readonly [string, string];
	appIcon: HTMLImageElement | null;
}

export async function composeCard(input: ComposeCardInput): Promise<Blob> {
	await loadFonts();

	const canvas = document.createElement('canvas');
	canvas.width = CANVAS_W;
	canvas.height = CANVAS_H;
	const ctx = canvas.getContext('2d');
	if (ctx === null) {
		throw new Error('Canvas 2D context unavailable');
	}

	paintPaper(ctx);
	drawPolaroid(ctx, input);
	drawInvite(ctx);
	drawCredit(ctx, input.appIcon);

	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
	if (blob === null) {
		throw new Error('Canvas toBlob returned null');
	}
	return blob;
}

function drawPolaroid(ctx: CanvasRenderingContext2D, input: ComposeCardInput): void {
	const captionH = CAP_TOP_PAD + CAP_CODE_SIZE + CAP_NAME_GAP + CAP_NAME_SIZE + CAP_BOTTOM_PAD;
	const cardH = CARD_PAD + PHOTO_H + captionH;
	const cardCx = CARD_X + CARD_W / 2;
	const cardCy = CARD_Y + cardH / 2;

	ctx.save();
	ctx.translate(cardCx, cardCy);
	ctx.rotate(CARD_ROTATE);
	ctx.translate(-cardCx, -cardCy);

	ctx.save();
	ctx.shadowColor = 'rgba(40,20,8,0.45)';
	ctx.shadowBlur = 90;
	ctx.shadowOffsetY = 50;
	ctx.fillStyle = CARD_DEPTH_COLOR;
	roundRectPath(ctx, CARD_X, CARD_Y + CARD_DEPTH, CARD_W, cardH, CARD_RADIUS);
	ctx.fill();
	ctx.restore();

	ctx.fillStyle = CARD_BG;
	roundRectPath(ctx, CARD_X, CARD_Y, CARD_W, cardH, CARD_RADIUS);
	ctx.fill();

	const photoX = CARD_X + CARD_PAD;
	const photoY = CARD_Y + CARD_PAD;
	const hasPhoto = input.photo !== null;
	const duo = hasPhoto && !input.isGenerated;

	if (duo && input.photo !== null) {
		const shotW = (PHOTO_INNER - DUO_GAP) / 2;
		drawPetWindow(ctx, input.photo, photoX, photoY, shotW, PHOTO_H, PHOTO_R);
		drawCharWindow(ctx, input.character, input.colors, photoX + shotW + DUO_GAP, photoY, shotW, PHOTO_H, PHOTO_R);
	} else if (hasPhoto && input.photo !== null) {
		ctx.save();
		roundRectPath(ctx, photoX, photoY, PHOTO_INNER, PHOTO_H, PHOTO_R);
		ctx.clip();
		ctx.fillStyle = CARD_BG;
		ctx.fillRect(photoX, photoY, PHOTO_INNER, PHOTO_H);
		drawCover(ctx, input.photo, photoX, photoY, PHOTO_INNER, PHOTO_H);
		ctx.restore();
	} else {
		drawCharWindow(ctx, input.character, input.colors, photoX, photoY, PHOTO_INNER, PHOTO_H, PHOTO_R);
	}

	const tapeY = CARD_Y - TAPE_H / 2 + 8;
	drawTape(ctx, BRAND_TAPE.x, tapeY, BRAND_TAPE.w, TAPE_H, (BRAND_TAPE.rotate * Math.PI) / 180, PRIMARY, {
		text: BRAND_TAPE.label,
		color: '#ffffff',
		size: TAPE_FONT_SIZE,
	});
	drawTape(ctx, SERVICE_TAPE.x, tapeY, SERVICE_TAPE.w, TAPE_H, (SERVICE_TAPE.rotate * Math.PI) / 180, GOLD, {
		text: SERVICE_TAPE.label,
		color: PRIMARY_ACTIVE,
		size: TAPE_FONT_SIZE,
	});

	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	let baseline = photoY + PHOTO_H + CAP_TOP_PAD + CAP_CODE_SIZE * 0.85;
	ctx.fillStyle = PRIMARY_ACTIVE;
	ctx.font = `${CAP_CODE_SIZE}px ${FONT_DISPLAY}`;
	ctx.fillText(input.type, cardCx, baseline);

	baseline += CAP_NAME_GAP + CAP_NAME_SIZE;
	ctx.fillStyle = INK;
	ctx.font = `${CAP_NAME_SIZE}px ${FONT_DISPLAY}`;
	ctx.fillText(input.typeName, cardCx, baseline);

	ctx.restore();
}

function drawInvite(ctx: CanvasRenderingContext2D): void {
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.fillStyle = INK;
	ctx.font = `${INVITE_LABEL_SIZE}px ${FONT_DISPLAY}`;
	ctx.fillText(INVITE_LABEL, CANVAS_W / 2, INVITE_LABEL_Y);
	ctx.fillStyle = PRIMARY_ACTIVE;
	ctx.font = `${INVITE_URL_SIZE}px ${FONT_DISPLAY}`;
	ctx.fillText(INVITE_URL, CANVAS_W / 2, INVITE_URL_Y);
}

function drawCredit(ctx: CanvasRenderingContext2D, appIcon: HTMLImageElement | null): void {
	ctx.font = `${CREDIT_SIZE}px ${FONT_DISPLAY}`;
	const prefixW = ctx.measureText(CREDIT_PREFIX).width;
	const brandW = ctx.measureText(CREDIT_BRAND).width;
	const suffixW = ctx.measureText(CREDIT_SUFFIX).width;
	const iconW = appIcon !== null ? CREDIT_ICON + CREDIT_GAP : 0;
	const totalW = prefixW + CREDIT_GAP + iconW + brandW + CREDIT_GAP + suffixW;

	let x = (CANVAS_W - totalW) / 2;
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';

	ctx.fillStyle = INK_MUTED;
	ctx.fillText(CREDIT_PREFIX, x, CREDIT_CY);
	x += prefixW + CREDIT_GAP;

	if (appIcon !== null) {
		const iconY = CREDIT_CY - CREDIT_ICON / 2;
		ctx.save();
		ctx.shadowColor = 'rgba(0,0,0,0.18)';
		ctx.shadowBlur = 8;
		ctx.shadowOffsetY = 4;
		roundRectPath(ctx, x, iconY, CREDIT_ICON, CREDIT_ICON, CREDIT_ICON_R);
		ctx.fillStyle = BRAND_RED;
		ctx.fill();
		ctx.restore();
		ctx.save();
		roundRectPath(ctx, x, iconY, CREDIT_ICON, CREDIT_ICON, CREDIT_ICON_R);
		ctx.clip();
		ctx.drawImage(appIcon, x, iconY, CREDIT_ICON, CREDIT_ICON);
		ctx.restore();
		x += iconW;
	}

	ctx.fillStyle = BRAND_RED;
	ctx.fillText(CREDIT_BRAND, x, CREDIT_CY);
	x += brandW + CREDIT_GAP;

	ctx.fillStyle = INK_MUTED;
	ctx.fillText(CREDIT_SUFFIX, x, CREDIT_CY);
}
