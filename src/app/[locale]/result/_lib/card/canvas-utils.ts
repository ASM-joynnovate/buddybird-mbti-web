import { displayFont } from './card-layout';

export async function loadFonts(): Promise<void> {
	if (typeof document === 'undefined' || !document.fonts) {
		return;
	}
	await document.fonts.ready;
	await document.fonts.load(
		`38px ${displayFont()}`,
		'인싸앵 집콕앵 현실앵 구름앵 팩폭앵 말랑앵 칼각앵 즉흥앵 Outgoing Reserved Practical Dreamy Logical Tender Orderly Spontaneous EISNTFJP 100%',
	);
}

export function roundRectPath(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.beginPath();
	if (typeof ctx.roundRect === 'function') {
		ctx.roundRect(x, y, w, h, r);
		return;
	}
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

export function drawCover(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	dx: number,
	dy: number,
	dw: number,
	dh: number,
): void {
	const imageRatio = img.naturalWidth / img.naturalHeight;
	const destRatio = dw / dh;

	let sx = 0;
	let sy = 0;
	let sw = img.naturalWidth;
	let sh = img.naturalHeight;

	if (imageRatio > destRatio) {
		sw = sh * destRatio;
		sx = (img.naturalWidth - sw) / 2;
	} else {
		sh = sw / destRatio;
		sy = (img.naturalHeight - sh) / 2;
	}

	ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}
