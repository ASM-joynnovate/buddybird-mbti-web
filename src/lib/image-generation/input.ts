export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function photoError(file: File): string | null {
	if (!PHOTO_TYPES.includes(file.type)) return 'JPEG, PNG, WebP 사진을 선택해 주세요.';
	if (file.size === 0 || file.size > MAX_PHOTO_BYTES) return '10MB 이하의 사진을 선택해 주세요.';
	return null;
}

// 폴라로이드(5:4)와 공유 카드 사진 칸(700×560)의 2배 크기
export const PHOTO_WIDTH = 1400;
export const PHOTO_HEIGHT = 1120;
export const PHOTO_ASPECT = PHOTO_WIDTH / PHOTO_HEIGHT;
