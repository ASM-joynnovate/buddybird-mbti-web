// Progress trail for the Test surface (issue #03 variant C): a horizontal band of
// step markers plus a "N / total" count. Exposed to assistive tech as a progressbar
// (issue #13); the decorative step markers stay aria-hidden.

interface ProgressIndicatorProps {
    current: number
    total: number
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
    return (
        <div
            className="test-trail"
            role="progressbar"
            aria-label="테스트 진행률"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={current}
            aria-valuetext={`${total}문항 중 ${current}번째`}
        >
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
