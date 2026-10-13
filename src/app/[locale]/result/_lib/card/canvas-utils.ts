import { displayFont } from './card-layout';

// 폰트 요청이 실패하지 않고 멈추는 경우에도 카드 생성이 막히지 않게 한다.
const FONT_TIMEOUT_MS = 2500;

export async function loadFonts(): Promise<void> {
	if (typeof document === 'undefined' || !document.fonts) {
		return;
	}
	const load = async () => {
		await document.fonts.ready;
		await document.fonts.load(
			`38px ${displayFont()}`,
			'인싸앵 집콕앵 현실앵 구름앵 팩폭앵 말랑앵 칼각앵 즉흥앵 Outgoing Reserved Practical Dreamy Logical Tender Orderly Spontaneous EISNTFJP 100%',
		);
	};
	try {
		await Promise.race([load(), new Promise((resolve) => setTimeout(resolve, FONT_TIMEOUT_MS))]);
	} catch {
		// 인앱 WebView 등에서 폰트 파일을 받지 못하면 NetworkError로 실패한다. 카드는 대체 글꼴로 그린다.
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
