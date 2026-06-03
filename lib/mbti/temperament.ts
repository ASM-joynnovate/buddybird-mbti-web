// Temperament-group mapping for the 16 types (CONTEXT.md domain concept). Each of
// the four groups owns one feather-accent color used for type identity across the
// funnel — result badge, intro carousel, and the share card band.
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

// On-screen color: the Tailwind @theme CSS var (globals.css). Use for large fills,
// badges, and decorative flourishes — not small text on a light surface.
export const GROUP_CSS_VAR: Record<TemperamentGroup, string> = {
    Analysts: 'var(--color-group-ruby)',
    Diplomats: 'var(--color-group-marigold)',
    Sentinels: 'var(--color-group-teal)',
    Explorers: 'var(--color-group-cobalt)',
}

// Raw hex mirror of the @theme group colors. Canvas (share card) cannot read CSS
// vars, so it needs literal hex. Keep in sync with globals.css.
export const GROUP_HEX: Record<TemperamentGroup, string> = {
    Analysts: '#e8443b',
    Diplomats: '#f4a93c',
    Sentinels: '#15b8a0',
    Explorers: '#3d7bd9',
}

// Deepened shades safe for white text on a group-colored band (raw hues miss
// AA 4.5:1 for small text — see DESIGN.md). Placeholder until issue #12 finalizes.
export const GROUP_TEXT_SAFE_HEX: Record<TemperamentGroup, string> = {
    Analysts: '#a8221b',
    Diplomats: '#9a5a08',
    Sentinels: '#0c6f60',
    Explorers: '#2a55a3',
}
