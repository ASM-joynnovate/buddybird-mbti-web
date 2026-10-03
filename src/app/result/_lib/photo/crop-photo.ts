import { PHOTO_HEIGHT, PHOTO_WIDTH } from '@/lib/image-generation/input';

export interface CropArea {
	x: number;
	y: number;
	width: number;
	height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error('사진을 읽을 수 없어요.'));
		image.src = src;
	});
}

// 원본 해상도가 작으면 확대하지 않고, 크면 PHOTO_WIDTH×PHOTO_HEIGHT로 줄인다.
export async function cropPhoto(src: string, area: CropArea): Promise<File> {
	const image = await loadImage(src);
	const scale = Math.min(1, PHOTO_WIDTH / area.width);
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(area.width * scale);
	canvas.height = Math.round((canvas.width * PHOTO_HEIGHT) / PHOTO_WIDTH);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('사진을 자를 수 없어요.');
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
	if (!blob) throw new Error('사진을 자를 수 없어요.');
	return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
}
