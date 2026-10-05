import { drawContain, drawCover, roundRectPath } from './canvas-utils';
import { CANVAS_H, CANVAS_W, PAPER_FALLBACK, PAPER_STOPS, PET_PLACEHOLDER_BG, displayFont } from './card-layout';

export function paintPaper(ctx: CanvasRenderingContext2D): void {
	try {
		const grad = ctx.createRadialGradient(
			CANVAS_W / 2,
			-CANVAS_H * 0.04,
			0,
			CANVAS_W / 2,
			-CANVAS_H * 0.04,
			CANVAS_H,
		);
		for (const [stop, color] of PAPER_STOPS) {
			grad.addColorStop(stop, color);
		}
		ctx.fillStyle = grad;
	} catch {
		ctx.fillStyle = PAPER_FALLBACK;
	}
	ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

export function drawCharWindow(
	ctx: CanvasRenderingContext2D,
	character: HTMLImageElement | null,
	colors: readonly [string, string],
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.save();
	roundRectPath(ctx, x, y, w, h, r);
	ctx.clip();

	const grad = ctx.createLinearGradient(x, y, x + w, y + h);
	grad.addColorStop(0, colors[0]);
	grad.addColorStop(1, colors[1]);
	ctx.fillStyle = grad;
	ctx.fillRect(x, y, w, h);

	drawRays(ctx, x + w / 2, y + h * 0.18, w * 0.82);

	if (character !== null) {
		drawContain(ctx, character, x + w * 0.06, y + h * 0.06, w * 0.88, h * 0.88);
	} else {
		ctx.fillStyle = 'rgba(255,255,255,0.92)';
		ctx.font = `${Math.round(h * 0.4)}px ${displayFont()}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('🦜', x + w / 2, y + h / 2);
	}

	drawVignette(ctx, x, y, w, h);
	ctx.restore();
}

export function drawPetWindow(
	ctx: CanvasRenderingContext2D,
	photo: HTMLImageElement,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.save();
	roundRectPath(ctx, x, y, w, h, r);
	ctx.clip();
	ctx.fillStyle = PET_PLACEHOLDER_BG;
	ctx.fillRect(x, y, w, h);
	drawCover(ctx, photo, x, y, w, h);
	ctx.restore();
}

function drawRays(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
	ctx.save();
	ctx.fillStyle = 'rgba(255,255,255,0.08)';
	const start = (8 * Math.PI) / 180;
	const wedge = (7 * Math.PI) / 180;
	const step = (30 * Math.PI) / 180;
	for (let a = start; a < start + Math.PI * 2; a += step) {
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.arc(cx, cy, radius, a, a + wedge);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
	const hi = ctx.createRadialGradient(x + w * 0.28, y + h * 0.08, 0, x + w * 0.28, y + h * 0.08, w * 0.9);
	hi.addColorStop(0, 'rgba(255,255,255,0.4)');
	hi.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = hi;
	ctx.fillRect(x, y, w, h);

	const lo = ctx.createRadialGradient(x + w * 0.5, y + h * 1.05, 0, x + w * 0.5, y + h * 1.05, h * 0.95);
	lo.addColorStop(0, 'rgba(0,0,0,0.32)');
	lo.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = lo;
	ctx.fillRect(x, y, w, h);
}

export interface TapeLabel {
	text: string;
	color: string;
	size: number;
}

export function drawTape(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	rotate: number,
	color: string,
	label?: TapeLabel,
): void {
	ctx.save();
	ctx.translate(x + w / 2, y + h / 2);
	ctx.rotate(rotate);
	ctx.globalAlpha = 0.82;
	ctx.shadowColor = 'rgba(0,0,0,0.16)';
	ctx.shadowBlur = 9;
	ctx.shadowOffsetY = 4;
	ctx.fillStyle = color;
	ctx.fillRect(-w / 2, -h / 2, w, h);
	ctx.shadowColor = 'transparent';
	ctx.beginPath();
	ctx.rect(-w / 2, -h / 2, w, h);
	ctx.clip();
	ctx.strokeStyle = 'rgba(255,255,255,0.22)';
	ctx.lineWidth = 10;
	for (let i = -h; i < w; i += 20) {
		ctx.beginPath();
		ctx.moveTo(-w / 2 + i, -h / 2 - 2);
		ctx.lineTo(-w / 2 + i + h + 4, h / 2 + 2);
		ctx.stroke();
	}
	if (label !== undefined) {
		ctx.globalAlpha = 1;
		ctx.fillStyle = label.color;
		ctx.font = `${label.size}px ${displayFont()}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(label.text, 0, 3);
	}
	ctx.restore();
}
