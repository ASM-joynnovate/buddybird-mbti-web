// Presentational progress text. No hooks, no state — the caller owns data-testid.

interface ProgressIndicatorProps {
    current: number
    total: number
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
    return (
        <span>
            {current} / {total}
        </span>
    )
}
