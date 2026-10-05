export async function loadImage(src: string): Promise<HTMLImageElement> {
	const image = new Image();
	image.decoding = 'async';
	image.src = src;
	await image.decode();
	return image;
}
