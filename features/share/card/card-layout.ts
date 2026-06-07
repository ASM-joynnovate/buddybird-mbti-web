// Share-card geometry (issue #09). A fixed 1080×1080 square — the Instagram-friendly
// format — with a rounded photo hero on top and a temperament-colored info band below
// carrying the type, name, copy, and BuddyBird branding. Mirrors the DESIGN.md
// result-card direction; coordinates are in card pixels (1:1, no dpr scaling, so the
// shared image is byte-for-byte deterministic for every viewer).

export const CARD_SIZE = 1080

export const HERO = { x: 56, y: 56, w: 968, h: 600, radius: 44 } as const
export const BAND = { x: 56, y: 680, w: 968, h: 344, radius: 44 } as const

export const CARD_BG = '#f4fbec'
export const HERO_PLACEHOLDER_BG = '#dcefcf'
export const BAND_TEXT = '#ffffff'
