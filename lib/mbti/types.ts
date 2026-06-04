// Shared MBTI domain contract.
// Every other module (engine, content, state, analytics, UI) imports from here.
// Keep this free of logic and side effects.

// The four canonical MBTI axes.
export type Axis = 'EI' | 'SN' | 'TF' | 'JP'

// The eight letters that make up the axes.
export type Letter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'

// A 4-letter result code, e.g. 'ENFP'. Validated against the known 16 types
// by the content/engine layer rather than the type system.
export type TypeCode = string

// Fixed axis ordering used to assemble a TypeCode and to label scores.
// `left`/`right` give a stable orientation per axis for axisScores.
export const AXES: readonly Axis[] = ['EI', 'SN', 'TF', 'JP']

export const AXIS_LETTERS: Record<Axis, { left: Letter; right: Letter }> = {
    EI: { left: 'E', right: 'I' },
    SN: { left: 'S', right: 'N' },
    TF: { left: 'T', right: 'F' },
    JP: { left: 'J', right: 'P' },
}

// A single selectable answer. Each choice weights exactly one axis letter by +1.
// `letter` must be one of the two letters belonging to `axis` (enforced by the engine).
export interface Choice {
    id: string
    label: string
    axis: Axis
    letter: Letter
}

// One question with exactly two choices. `axis` is the axis this question scores.
// `emoji` is the playful glyph shown above the question on the Test card ("동화숲
// 월드" quiz design).
export interface Question {
    id: string
    axis: Axis
    emoji: string
    text: string
    choices: [Choice, Choice]
}

// Presentation data for one of the 16 result types.
// `name` is the catchy nickname, `report` a short tagline reused by the share
// card, and `description` the full character blurb shown on the result page and
// carousel.
//
// `colors` is the per-type 2-stop identity gradient ("동화숲 월드", ADR-0002): the
// primary visual identity across the result hero, dex cards, type modal, and share
// card. Use content/gradient.ts (`typeGradient` / `typeColors`) to consume it — CSS
// gets a linear-gradient string, Canvas gets the raw hex pair.
//
// `match` is the type's two "best match" codes, shown as MatchChips on the result
// page and in the type modal (deep-link to /dex?focus=CODE).
//
// `imageKey` is a stable slug for the parrot character art. Currently unused for
// resolving the image (assets.ts derives the path from the uppercase code) but kept
// as a stable identifier.
export interface TypeInfo {
    code: TypeCode
    name: string
    report: string
    description: string
    colors: readonly [string, string]
    match: readonly [TypeCode, TypeCode]
    imageKey: string
}

// Per-axis tally, oriented by AXIS_LETTERS.
export interface AxisScore {
    left: number
    right: number
}

// Output of the pure compute function.
export interface ComputeResult {
    type: TypeCode
    axisScores: Record<Axis, AxisScore>
}
