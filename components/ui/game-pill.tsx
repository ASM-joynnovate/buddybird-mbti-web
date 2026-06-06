// Pill chip of the raised-block system (DESIGN.md chip component). Two skins:
// `cream` — quiet game chrome (hero stats, quiz count, eyebrows): cream fill +
// softened-orange border + small depth bar; `orange` — emphasis chip (match
// codes, "다음" tags, count badges): orange gradient fill, Jua white label,
// primary-active depth bar. Variant classes carry CHROME only; default
// gap/padding/typography come separately so `bare` consumers (hero stats, deck
// title) can own their sizing without utility conflicts. Faction chips stay the
// caller's business (inline background). Server-component friendly (no hooks).
import type { ReactNode } from 'react'

export type GamePillVariant = 'cream' | 'orange'

const CHROME_CLASS: Record<GamePillVariant, string> = {
    cream: 'inline-flex items-center rounded-full border-2 border-border-action bg-surface-cream shadow-[0_3px_0_var(--color-depth-action)]',
    orange: 'inline-flex items-center rounded-full bg-[linear-gradient(180deg,#eb8a4b,var(--color-primary))] shadow-[0_2px_0_var(--color-primary-active)]',
}

const SIZE_CLASS: Record<GamePillVariant, string> = {
    cream: 'gap-2 px-4 py-[7px] text-[13px] font-bold text-primary-active',
    orange: 'gap-1.5 px-3.5 py-1 font-display text-[13px] tracking-[0.04em] text-on-primary',
}

interface GamePillProps {
    children: ReactNode
    variant?: GamePillVariant
    /** Skip the default gap/padding/typography — the caller supplies its own. */
    bare?: boolean
    as?: 'span' | 'div' | 'p'
    className?: string
    'data-testid'?: string
}

export function GamePill({
    children,
    variant = 'cream',
    bare = false,
    as: Tag = 'span',
    className,
    ...rest
}: GamePillProps) {
    const classes = [CHROME_CLASS[variant], bare ? null : SIZE_CLASS[variant], className]
        .filter(Boolean)
        .join(' ')

    return (
        <Tag className={classes} {...rest}>
            {children}
        </Tag>
    )
}
