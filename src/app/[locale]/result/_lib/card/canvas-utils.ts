import { CAP_CODE_SIZE, displayFont } from './card-layout';

export async function loadFonts(): Promise<void> {
	if (typeof document === 'undefined' || !document.fonts) {
		return;
	}
	await document.fonts.ready;
	try {
		await document.fonts.load(`${CAP_CODE_SIZE}px ${displayFont()}`);
	} catch {}
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

export function drawContain(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	dx: number,
	dy: number,
	dw: number,
	dh: number,
): void {
	const imageRatio = img.naturalWidth / img.naturalHeight;
	const destRatio = dw / dh;
	let w = dw;
	let h = dh;
	if (imageRatio > destRatio) {
		h = dw / imageRatio;
	} else {
		w = dh * imageRatio;
	}
	ctx.save();
	ctx.shadowColor = 'rgba(0,0,0,0.4)';
	ctx.shadowBlur = 14;
	ctx.shadowOffsetY = 12;
	ctx.drawImage(img, dx + (dw - w) / 2, dy + (dh - h) / 2, w, h);
	ctx.restore();
}
