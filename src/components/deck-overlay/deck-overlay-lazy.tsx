'use client';

import dynamic from 'next/dynamic';

import type { DeckOverlayProps } from './deck-overlay';

const DeckOverlayImpl = dynamic(() => import('./deck-overlay').then((mod) => mod.DeckOverlay), {
	ssr: false,
});

export function DeckOverlay({ controller, onSelect }: DeckOverlayProps) {
	if (!controller.isEngaged) {
		return null;
	}
	return <DeckOverlayImpl controller={controller} onSelect={onSelect} />;
}
