// Choice row for the Test surface (issue #03 variant C): a feather accent bar,
// the label on a safe rectangle, and a chevron. The whole row is the hit target;
// selecting auto-advances.

import type { CSSProperties } from 'react'

interface ChoiceButtonProps {
    label: string
    onSelect: () => void
    testId: string
    /** Decorative feather-accent color (CSS color or var). Falls back to foliage. */
    feather?: string
}

export function ChoiceButton({ label, onSelect, testId, feather }: ChoiceButtonProps) {
    return (
        <button
            type="button"
            data-testid={testId}
            aria-label={label}
            onClick={onSelect}
            className="choice-row"
            style={feather ? ({ '--choice-feather': feather } as CSSProperties) : undefined}
        >
            <span className="choice-bar" aria-hidden="true" />
            <span className="choice-label">{label}</span>
            <span className="choice-chevron" aria-hidden="true">
                →
            </span>
        </button>
    )
}
