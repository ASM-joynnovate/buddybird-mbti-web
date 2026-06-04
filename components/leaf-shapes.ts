// Low-poly leaf geometry (monstera / palm / general), computed once at module load.
// Pure vector facets in a local 0..100 × 0..130 box — each leaf is a set of flat-color
// polygon facets plus a central vein; the monstera also carries a clip path of its
// drooping lobed silhouette. Consumed by components/leaf-field.tsx, which maps each tone
// key to a concrete color and renders the <svg>. No raster, no <image>.

export type LeafShape = 'monstera' | 'palm' | 'general'
export type ToneKey = 'f1' | 'f2' | 'f3' | 'f4' | 'f5'

export interface Facet {
    points: string
    tone: ToneKey
}
export interface LeafGeometry {
    facets: Facet[]
    vein: string
    clip?: string
}

type Pt = readonly [number, number]

const round = (n: number): number => Math.round(n * 10) / 10
const fmt = (pts: Pt[]): string => pts.map(([x, y]) => `${round(x)},${round(y)}`).join(' ')
const mirrorX = ([x, y]: Pt): Pt => [100 - x, y]
const tri = (a: Pt, b: Pt, c: Pt, tone: ToneKey): Facet => ({ points: fmt([a, b, c]), tone })
const sub = (pts: Pt[]): string =>
    'M' + pts.map(([x, y]) => `${round(x)},${round(y)}`).join('L') + 'Z'

// ── General leaf — almond/ovate with a clean central vein and side facets ─────
function generalLeaf(): LeafGeometry {
    const S0: Pt = [50, 6],
        S1: Pt = [50, 42],
        S2: Pt = [50, 72],
        S3: Pt = [50, 100],
        S4: Pt = [50, 126]
    const R1: Pt = [62, 30],
        R2: Pt = [74, 58],
        R3: Pt = [78, 84],
        R4: Pt = [64, 108]
    const L1 = mirrorX(R1),
        L2 = mirrorX(R2),
        L3 = mirrorX(R3),
        L4 = mirrorX(R4)
    const facets: Facet[] = [
        tri(S0, R1, S1, 'f2'),
        tri(S1, R1, R2, 'f1'),
        tri(S1, R2, S2, 'f3'),
        tri(S2, R2, R3, 'f2'),
        tri(S2, R3, S3, 'f4'),
        tri(S3, R3, R4, 'f3'),
        tri(S3, R4, S4, 'f5'),
        tri(S0, L1, S1, 'f3'),
        tri(S1, L1, L2, 'f2'),
        tri(S1, L2, S2, 'f4'),
        tri(S2, L2, L3, 'f3'),
        tri(S2, L3, S3, 'f5'),
        tri(S3, L3, L4, 'f4'),
        tri(S3, L4, S4, 'f5'),
    ]
    return {
        facets,
        vein: fmt([
            [48.5, 12],
            [51.5, 12],
            [50.7, 120],
            [49.3, 120],
        ]),
    }
}

// ── Palm frond — central spine with many narrow upward-angled leaflets ────────
function palmLeaf(): LeafGeometry {
    // [spineHi y, spineLo y, tipX, tipY] — tips angle up for a clean frond silhouette
    const segs: readonly [number, number, number, number][] = [
        [98, 112, 66, 92],
        [86, 100, 78, 78],
        [72, 88, 88, 62],
        [56, 74, 92, 46],
        [42, 60, 86, 30],
        [30, 46, 74, 18],
        [20, 34, 60, 10],
    ]
    const facets: Facet[] = []
    segs.forEach(([yh, ylo, tx, ty], i) => {
        const mid = (yh + ylo) / 2
        const even = i % 2 === 0
        const up: ToneKey = even ? 'f1' : 'f2'
        const lo: ToneKey = even ? 'f3' : 'f4'
        facets.push(tri([50, yh], [tx, ty], [50, mid], up))
        facets.push(tri([50, mid], [tx, ty], [50, ylo], lo))
        const lUp: ToneKey = even ? 'f2' : 'f3'
        const lLo: ToneKey = even ? 'f4' : 'f5'
        facets.push(tri([50, yh], [100 - tx, ty], [50, mid], lUp))
        facets.push(tri([50, mid], [100 - tx, ty], [50, ylo], lLo))
    })
    facets.push(tri([50, 4], [43, 26], [57, 26], 'f2')) // top spear
    return {
        facets,
        vein: fmt([
            [48.5, 8],
            [51.5, 8],
            [50.8, 122],
            [49.2, 122],
        ]),
    }
}

// ── Monstera — smooth lobed contour (ellipse profile + Gaussian split notches)
// with downward-drooping side lobes, fan-triangulated facets + silhouette clip ─
function monsteraLeaf(): LeafGeometry {
    const N = 34
    const gaps = [
        { c: 0.27, d: 0.82, w: 0.05 },
        { c: 0.5, d: 0.88, w: 0.05 },
        { c: 0.73, d: 0.74, w: 0.055 },
    ]
    const factor = (t: number): number => {
        let f = 1
        for (const g of gaps) f -= g.d * Math.exp(-(((t - g.c) / g.w) ** 2))
        return Math.max(0.14, f)
    }
    const clampUnit = (t: number): number => Math.min(1, Math.max(0, t))
    const profile = (t: number): number => 46 * Math.sin(Math.PI * clampUnit(t)) * factor(t)
    // Droop: push each margin point DOWN proportional to its horizontal reach (profile),
    // so the side lobes sag downward while the spine ends (profile≈0) stay anchored.
    const droopK = 0.34
    const right: Pt[] = []
    for (let i = 0; i <= N; i++) {
        const t = i / N
        const w = profile(t)
        right.push([50 + w, 8 + 118 * t + droopK * w])
    }
    const left = right.slice(1, N).reverse().map(mirrorX)
    const outline = [...right, ...left]

    const clip = sub(outline)

    const C: Pt = [50, 64]
    const toneFor = (mx: number, my: number): ToneKey => {
        if (mx >= 50) return my < 42 ? 'f1' : my < 74 ? 'f2' : 'f3'
        return my < 42 ? 'f2' : my < 74 ? 'f3' : 'f4'
    }
    const facets: Facet[] = outline.map((a, i) => {
        const b = outline[(i + 1) % outline.length]
        const mx = (a[0] + b[0] + C[0]) / 3
        const my = (a[1] + b[1] + C[1]) / 3
        return tri(C, a, b, toneFor(mx, my))
    })
    return {
        facets,
        vein: fmt([
            [48, 16],
            [52, 16],
            [50.7, 122],
            [49.3, 122],
        ]),
        clip,
    }
}

export const SHAPES: Record<LeafShape, LeafGeometry> = {
    monstera: monsteraLeaf(),
    palm: palmLeaf(),
    general: generalLeaf(),
}
