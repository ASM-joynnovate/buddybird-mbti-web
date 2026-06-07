// Public entry of the deck-overlay system: the shared progress controller and
// the full-screen overlay. DeckCard stays internal. The overlay export is the
// lazy wrapper (deck-overlay-lazy.tsx) so the heavy 16-card grid chunk loads
// on first engagement instead of shipping in the initial bundle.
export { DeckOverlay } from './deck-overlay-lazy'
export { useDeckController, type DeckController } from './use-deck-controller'
