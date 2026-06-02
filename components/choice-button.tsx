// Presentational choice button wrapper used by the Test surface.

interface ChoiceButtonProps {
    label: string
    onSelect: () => void
    testId: string
}

export function ChoiceButton({ label, onSelect, testId }: ChoiceButtonProps) {
    return (
        <button
            type="button"
            data-testid={testId}
            aria-label={label}
            onClick={onSelect}
            className="w-full rounded-md border border-zinc-300 px-4 py-3 text-left text-base"
        >
            {label}
        </button>
    )
}
