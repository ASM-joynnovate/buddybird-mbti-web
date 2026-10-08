export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

export function displayFont(): string {
	return getComputedStyle(document.documentElement).getPropertyValue('--font-jua').trim() || 'system-ui, sans-serif';
}
