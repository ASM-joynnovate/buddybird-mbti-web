import type { CSSProperties } from 'react';

export const DECAL_WRAPPER_CLASS =
	'pointer-events-none absolute top-(--y) left-(--x) w-(--w) -translate-x-1/2 -translate-y-1/2 rotate-(--r) select-none';
export const DECAL_IMAGE_CLASS = 'block h-auto w-full select-none drop-shadow-[0_6px_12px_rgba(46,36,20,0.16)]';

export function decalStyle(vars: { x: string; y: string; w: string; r: string }): CSSProperties {
	return {
		'--x': vars.x,
		'--y': vars.y,
		'--w': vars.w,
		'--r': vars.r,
	} as CSSProperties;
}
