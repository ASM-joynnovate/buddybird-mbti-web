// App-wide low-poly leaf backdrop (동화숲) — a fixed layer behind every screen,
// mounted once in app/layout.tsx so intro, test, and dex all share it. Each leaf is an
// inline faceted SVG (monstera / palm / general) built from flat polygon facets + a
// central vein; the monstera also carries an even-odd clip (lobes + Swiss-cheese holes).
// Geometry lives in ./leaf-shapes; colors are flat per-shape palettes. Server component:
// markup is static, motion + reduced-motion are CSS-only, so no JS ships.
import type { CSSProperties } from 'react'
import { SHAPES, type LeafShape, type ToneKey } from './leaf-shapes'
import './leaf-field.css'

type Tone = 'bright' | 'deep'
type Palette = Record<ToneKey, string> & { rib: string }

// Flat facet palettes per the brief: monstera = green/emerald/mint/teal; palm = bright
// green/yellow-green/teal; general = green/olive/light yellow-green. `deep` variants
// recede the backdrop leaves. (These extend the forest-green tokens with the mint/teal/
// olive accents the redesign asked for.)
const PALETTES: Record<LeafShape, Record<Tone, Palette>> = {
    monstera: {
        bright: {
            f1: '#8FE0A8',
            f2: '#54B873',
            f3: '#2E8B57',
            f4: '#1F8A6E',
            f5: '#176B53',
            rib: '#114C3C',
        },
        deep: {
            f1: '#5FB985',
            f2: '#2E8B57',
            f3: '#1F7A5C',
            f4: '#176B53',
            f5: '#114C3C',
            rib: '#0C3A2E',
        },
    },
    palm: {
        bright: {
            f1: '#BFE05A',
            f2: '#7FC844',
            f3: '#54A838',
            f4: '#2E9472',
            f5: '#1F7A5C',
            rib: '#2E6B2E',
        },
        deep: {
            f1: '#8FC740',
            f2: '#5BA033',
            f3: '#3C7A24',
            f4: '#2E8B6B',
            f5: '#1F6B4E',
            rib: '#1C4D1C',
        },
    },
    general: {
        bright: {
            f1: '#CFE07A',
            f2: '#8FC84F',
            f3: '#5B9E3A',
            f4: '#7C8B36',
            f5: '#4E6B2A',
            rib: '#38501C',
        },
        deep: {
            f1: '#A9C95C',
            f2: '#6DAE3F',
            f3: '#4E7E2A',
            f4: '#5E6B2A',
            f5: '#3C5A1E',
            rib: '#29400F',
        },
    },
}

interface LeafConfig {
    shape: LeafShape
    tone: Tone
    size: number // px width (height follows the 100×130 viewBox aspect)
    rot: number // base orientation, degrees
    dur: number // drift duration, seconds
    opacity: number
    pos: CSSProperties // absolute placement (top/left/right/bottom)
}

// Six leaves — positions, sizes, and opacity rhythm carried over from the original
// backdrop so the layout flow is unchanged; only the shapes/colors are new.
const LEAVES: readonly LeafConfig[] = [
    {
        shape: 'palm',
        tone: 'deep',
        size: 150,
        rot: 24,
        dur: 10,
        opacity: 0.42,
        pos: { top: '26%', right: -64 },
    },
    {
        shape: 'general',
        tone: 'bright',
        size: 96,
        rot: -8,
        dur: 9,
        opacity: 0.38,
        pos: { top: '48%', left: '40%' },
    },
    {
        shape: 'monstera',
        tone: 'deep',
        size: 200,
        rot: 14,
        dur: 11,
        opacity: 0.4,
        pos: { bottom: '8%', left: -80 },
    },
    {
        shape: 'palm',
        tone: 'bright',
        size: 150,
        rot: 32,
        dur: 8.5,
        opacity: 0.46,
        pos: { bottom: -30, right: -56 },
    },
    {
        shape: 'general',
        tone: 'deep',
        size: 70,
        rot: -22,
        dur: 10.5,
        opacity: 0.32,
        pos: { top: '14%', left: '14%' },
    },
]

function LeafSvg({
    shape,
    palette,
    clipId,
}: {
    shape: LeafShape
    palette: Palette
    clipId: string
}) {
    const geo = SHAPES[shape]
    const body = (
        <>
            {geo.facets.map((f, i) => (
                <polygon key={i} points={f.points} fill={palette[f.tone]} />
            ))}
            <polygon points={geo.vein} fill={palette.rib} />
        </>
    )
    return (
        <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" focusable="false">
            {geo.clip ? (
                <>
                    <clipPath id={clipId}>
                        <path d={geo.clip} clipRule="evenodd" />
                    </clipPath>
                    <g clipPath={`url(#${clipId})`}>{body}</g>
                </>
            ) : (
                body
            )}
        </svg>
    )
}

export function LeafField() {
    return (
        <div className="bg-decor" aria-hidden="true">
            {LEAVES.map((leaf, i) => {
                const style = {
                    ...leaf.pos,
                    '--lf-size': `${leaf.size}px`,
                    '--lf-rot': `${leaf.rot}deg`,
                    '--lf-dur': `${leaf.dur}s`,
                    '--lf-opacity': leaf.opacity,
                } as CSSProperties
                return (
                    <span className="leaf" key={i} style={style}>
                        <LeafSvg
                            shape={leaf.shape}
                            palette={PALETTES[leaf.shape][leaf.tone]}
                            clipId={`leaf-clip-${i}`}
                        />
                    </span>
                )
            })}
        </div>
    )
}
