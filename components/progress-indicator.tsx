// Progress trail for the Test surface (issue #03 variant C): a horizontal band of
// step markers plus a "N / total" count. Presentational only — the caller owns the
// data-testid="progress" wrapper.

interface ProgressIndicatorProps {
    current: number
    total: number
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
    return (
        <div className="test-trail">
            {Array.from({ length: total }, (_, i) => {
                const step = i + 1
                const state =
                    step < current
                        ? ' test-step--done'
                        : step === current
                          ? ' test-step--current'
                          : ''
                return <span key={i} className={`test-step${state}`} aria-hidden="true" />
            })}
            <span className="test-count">
                {current} / {total}
            </span>
        </div>
    )
}
