// Temperament-group mapping for the 16 types (CONTEXT.md domain concept). Each of
// the four groups owns one faction accent (DESIGN.md) used for type identity across
// the funnel — result badge, intro deck, and the share card band. Faction colors
// label CONTENT only; they never style actions (the orange family owns those).
//
// Group rules read the SN/TF/JP letters of a TypeCode (assembled in EI,SN,TF,JP
// order): NT -> Analysts, NF -> Diplomats, SJ -> Sentinels, SP -> Explorers.

import type { TypeCode } from './types'

export type TemperamentGroup = 'Analysts' | 'Diplomats' | 'Sentinels' | 'Explorers'

// Resolve the temperament group for a 4-letter type code. Defaults to 'Sentinels'
// only if the code is malformed (engine guarantees well-formed codes in practice).
export function temperamentGroup(type: TypeCode): TemperamentGroup {
    const sn = type[1]
    const tf = type[2]
    const jp = type[3]

    if (sn === 'N') {
        return tf === 'T' ? 'Analysts' : 'Diplomats'
    }
    return jp === 'J' ? 'Sentinels' : 'Explorers'
}

// On-screen color: the Tailwind @theme CSS var (globals.css faction palette). Use
// for large fills, badges, and decorative flourishes — not small text on a light
// surface.
export const GROUP_CSS_VAR: Record<TemperamentGroup, string> = {
    Analysts: 'var(--color-faction-analyst)',
    Diplomats: 'var(--color-faction-diplomat)',
    Sentinels: 'var(--color-faction-sentinel)',
    Explorers: 'var(--color-faction-explorer)',
}

// Deepened faction shades safe for white text on a group-colored band. Verified
// against WCAG AA 4.5:1 for white (#fff) small text: Analysts 9.3:1, Diplomats
// 5.9:1, Sentinels 5.5:1, Explorers 4.9:1. (Raw hues miss AA except analyst.)
export const GROUP_TEXT_SAFE_HEX: Record<TemperamentGroup, string> = {
    Analysts: '#5e2f8c',
    Diplomats: '#b13367',
    Sentinels: '#2a6ca8',
    Explorers: '#a85f12',
}
