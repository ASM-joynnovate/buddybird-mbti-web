import { AXES, AXIS_LETTERS, type Axis, type AxisScore, type TypeCode } from '@/types/mbti';

import { AXIS_META } from '@/lib/content/axes';
import type { Locale } from '@/lib/i18n/locale';
import { translator } from '@/lib/i18n/translate';

import { drawCover, loadFonts, roundRectPath } from './canvas-utils';
import { CANVAS_H, CANVAS_W, displayFont } from './card-layout';

// Figma 13:12 exports had an opaque #f5f5f5 frame background; these PNGs restore the intended transparency.
const OVERLAY_TYPES = [
	'ESTJ',
	'ESTP',
	'ESFJ',
	'ESFP',
	'ENTJ',
	'ENTP',
	'ENFJ',
	'ENFP',
	'ISTJ',
	'ISTP',
	'ISFJ',
	'ISFP',
	'INTJ',
	'INTP',
	'INFJ',
	'INFP',
] as const;

// The Figma section export includes its shadow and artboard margins.
const BASE_CROP = { x: 140, y: 140, width: CANVAS_W, height: CANVAS_H } as const;
const PHOTO = { x: 116, y: 429, width: 848, height: 681 } as const;
// Approved 1080×1920 preview: 30px capsule, 6px lower face, 70px row spacing.
const BAR = { x: 392, width: 426, height: 30, depth: 6, firstCenterY: 1187, rowGap: 70 } as const;

interface ComposeCardInput {
	type: TypeCode;
	photo: HTMLImageElement;
	axisScores: Record<Axis, AxisScore>;
	locale: Locale;
}

export async function composeCard({ type, photo, axisScores, locale }: ComposeCardInput): Promise<Blob> {
	if (!OVERLAY_TYPES.some((overlayType) => overlayType === type)) {
		throw new Error(`Unsupported MBTI type: ${type}`);
	}

	const assetDirectory = locale === 'en' ? '/assets/share-card/en' : '/assets/share-card';
	const [base, overlay] = await Promise.all([
		loadCardAsset(`${assetDirectory}/base.png`),
		loadCardAsset(`${assetDirectory}/${type}.png`),
		loadFonts(),
	]);

	const canvas = document.createElement('canvas');
	canvas.width = CANVAS_W;
	canvas.height = CANVAS_H;
	const ctx = canvas.getContext('2d');
	if (ctx === null) throw new Error('Canvas 2D context unavailable');

	if (locale === 'en') {
		// The English Figma frame already exports at the final 1080×1920 size.
		ctx.drawImage(base, 0, 0, CANVAS_W, CANVAS_H);
	} else {
		ctx.drawImage(base, BASE_CROP.x, BASE_CROP.y, BASE_CROP.width, BASE_CROP.height, 0, 0, CANVAS_W, CANVAS_H);
	}
	drawCover(ctx, photo, PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height);
	ctx.drawImage(overlay, 0, 0, CANVAS_W, CANVAS_H);
	drawAxisBars(ctx, type, axisScores, locale);

	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
	if (blob === null) throw new Error('Canvas toBlob returned null');
	return blob;
}

function loadCardAsset(src: string): Promise<HTMLImageElement> {
	const image = new Image();
	image.decoding = 'async';
	image.src = src;
	return image.decode().then(() => image);
}

function drawAxisBars(
	ctx: CanvasRenderingContext2D,
	type: TypeCode,
	axisScores: Record<Axis, AxisScore>,
	locale: Locale,
): void {
	ctx.save();
	ctx.textBaseline = 'middle';
	const font = displayFont();
	const t = translator(locale);

	AXES.forEach((axis, index) => {
		const score = axisScores[axis];
		const total = score.left + score.right;
		const leftWins =
			score.left === score.right ? type[index] === AXIS_LETTERS[axis].left : score.left > score.right;
		const side = leftWins ? 'left' : 'right';
		const meta = AXIS_META[axis][side];
		const percent = total > 0 ? Math.round((Math.max(score.left, score.right) / total) * 100) : 100;
		const centerY = BAR.firstCenterY + BAR.rowGap * index;
		const barY = centerY - BAR.height / 2;

		ctx.textAlign = 'left';
		ctx.fillStyle = '#3e3023';
		ctx.font = `38px ${font}`;
		const label = `${t(meta.label)} ${meta.letter}`;
		const labelWidth = BAR.x - 120 - 24;
		const fontSize = Math.min(38, (38 * labelWidth) / ctx.measureText(label).width);
		ctx.font = `${fontSize}px ${font}`;
		ctx.fillText(label, 120, centerY + 1);

		ctx.fillStyle = '#e7d9b8';
		roundRectPath(ctx, BAR.x, barY, BAR.width, BAR.height, BAR.height / 2);
		ctx.fill();
		drawRaisedBar(ctx, barY, (BAR.width * percent) / 100, meta.color);

		ctx.textAlign = 'right';
		ctx.fillStyle = '#883f20';
		ctx.font = `50px ${font}`;
		ctx.fillText(`${percent}%`, 960, centerY + 2);
	});
	ctx.restore();
}

function drawRaisedBar(ctx: CanvasRenderingContext2D, y: number, width: number, color: string): void {
	if (width <= 0) return;

	ctx.fillStyle = tint(color, -0.2);
	roundRectPath(ctx, BAR.x, y, width, BAR.height, Math.min(BAR.height / 2, width / 2));
	ctx.fill();

	const faceHeight = BAR.height - BAR.depth;
	const face = ctx.createLinearGradient(0, y, 0, y + faceHeight);
	face.addColorStop(0, tint(color, 0.13));
	face.addColorStop(0.2, color);
	face.addColorStop(1, color);
	ctx.fillStyle = face;
	roundRectPath(ctx, BAR.x, y, width, faceHeight, Math.min(faceHeight / 2, width / 2));
	ctx.fill();
}

function tint(hex: string, amount: number): string {
	const target = amount < 0 ? 0 : 255;
	const channels = [1, 3, 5].map((offset) => {
		const channel = parseInt(hex.slice(offset, offset + 2), 16);
		return Math.round(channel + (target - channel) * Math.abs(amount));
	});
	return `rgb(${channels.join(',')})`;
}
