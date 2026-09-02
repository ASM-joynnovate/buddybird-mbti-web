'use client';

// Subscribes to the user's reduced-motion preference. Used to pause auto-advancing
// motion (intro carousel, future surfaces) and fall back to manual control.
// Implemented with useSyncExternalStore so the matchMedia subscription stays in sync
// without cascading renders, and renders a safe `false` snapshot during SSR/static
// export where `window` is absent.
import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function hasMatchMedia(): boolean {
	return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function subscribe(onChange: () => void): () => void {
	if (!hasMatchMedia()) {
		return () => {};
	}
	const query = window.matchMedia(REDUCED_MOTION_QUERY);
	query.addEventListener('change', onChange);
	return () => query.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
	return hasMatchMedia() ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false;
}

function getServerSnapshot(): boolean {
	return false;
}

export function useReducedMotion(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
