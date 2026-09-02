'use client';

// Lazy public face of the full-screen deck overlay. The 16-card grid (deck
// card stack, portal, close gestures) is interaction-only UI, so its chunk is
// code-split out of the initial bundle and fetched the moment the deck first
// engages (scrub start / "16유형 모두 보기"). Until then nothing renders —
// which matches the impl's own `isEngaged` guard, so the swap is seamless.
import dynamic from 'next/dynamic';

import type { TypeCode } from '@/lib/mbti';

import type { DeckController } from './use-deck-controller';

const DeckOverlayImpl = dynamic(() => import('./deck-overlay').then((mod) => mod.DeckOverlay), {
	ssr: false,
});

interface DeckOverlayProps {
	controller: DeckController;
	/** Tap a deck card → open its detail popup (owned by the caller). */
	onSelect: (code: TypeCode) => void;
}

export function DeckOverlay({ controller, onSelect }: DeckOverlayProps) {
	// Gate the render (not just the impl's internal null return) so the chunk
	// request itself is deferred until the deck is actually engaged.
	if (!controller.isEngaged) {
		return null;
	}
	return <DeckOverlayImpl controller={controller} onSelect={onSelect} />;
}
