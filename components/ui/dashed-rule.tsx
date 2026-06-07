// Dashed horizontal rule of the trading-card vocabulary — a 2px repeating
// orange dash (7px dash / 5px gap) used between the card head and the blurb,
// and inside the detail popup. Margin is the caller's concern via className.
interface DashedRuleProps {
    className?: string
}

export function DashedRule({ className }: DashedRuleProps) {
    const classes = [
        'h-0.5 rounded-xs bg-[repeating-linear-gradient(90deg,var(--color-border-action)_0_7px,transparent_7px_12px)]',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return <div className={classes} aria-hidden="true" />
}
