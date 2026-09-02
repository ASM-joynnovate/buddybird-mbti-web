// Generic 2D-canvas primitives for the share-card compositor — no card-specific
// knowledge, just geometry/text helpers used by compose-card and card-parts.
import { CAP_CODE_SIZE, CAP_TAG_SIZE } from './card-layout';

// Best-effort: wait for the card fonts so the first paint isn't a fallback
// glyph. Never throws — degrades to whatever is already loaded.
export async function loadFonts(): Promise<void> {
	if (typeof document === 'undefined' || !document.fonts) {
		return;
	}
	await document.fonts.ready;
	try {
		await Promise.all([
			document.fonts.load(`${CAP_CODE_SIZE}px "Jua"`),
			document.fonts.load(`${CAP_TAG_SIZE}px "Noto Sans KR"`),
		]);
	} catch {
		// Font loading is best-effort — fall back to available fonts.
	}
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

// Cover the destination rect with `img`, center-cropping the overflow (cover).
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

// Fit `img` inside the destination rect, preserving ratio and centering (contain).
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

// Break `text` into at most `maxLines` lines fitting `maxWidth` (Korean has no
// word boundaries, so break per character; ellipsize the last line on overflow).
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const char of [...text]) {
		const candidate = line + char;
		if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
			lines.push(line);
			line = char;
		} else {
			line = candidate;
		}
	}
	if (line !== '') {
		lines.push(line);
	}
	const clipped = lines.slice(0, maxLines);
	if (lines.length > maxLines && clipped.length > 0) {
		const last = clipped[clipped.length - 1];
		const base = last.length > 1 ? last.slice(0, -1) : last;
		clipped[clipped.length - 1] = `${base}…`;
	}
	return clipped;
}
