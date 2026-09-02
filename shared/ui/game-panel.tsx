// Cream content panel — the raised-block surface for grouped content sitting in
// the forest world (quiz card, result panels, photo/share panel, detail match
// panel). One recipe: cream fill + softened-orange border + raise-panel shadow,
// with an optional dashed inner frame (the quest-card look). Padding/layout are
// the caller's concern via className. Server-component friendly (no hooks).
import type { ReactNode } from 'react';

const PANEL_CLASS =
	'relative rounded-panel border-[length:var(--border-panel)] border-border-action bg-surface-cream text-ink shadow-raise-panel';

// Dashed inner frame, inset 6px, in a softened orange (opaque color-mix into the
// cream surface — chrome carries no decorative alpha by rule, DESIGN.md).
const DASHED_FRAME_CLASS =
	'before:pointer-events-none before:absolute before:inset-1.5 before:rounded-lg before:border-[length:var(--border-hair)] before:border-dashed before:border-[color-mix(in_srgb,var(--color-primary)_28%,var(--color-surface-cream))] before:content-[""]';

interface GamePanelProps {
	children: ReactNode;
	/** Quest-card dashed inner frame (quiz card vocabulary). */
	dashedFrame?: boolean;
	/** Semantic element — defaults to div; use 'section' with an aria-label. */
	as?: 'div' | 'section';
	className?: string;
	'aria-label'?: string;
	'data-testid'?: string;
}

export function GamePanel({ children, dashedFrame = false, as: Tag = 'div', className, ...rest }: GamePanelProps) {
	const classes = [PANEL_CLASS, dashedFrame ? DASHED_FRAME_CLASS : null, className].filter(Boolean).join(' ');

	return (
		<Tag className={classes} {...rest}>
			{children}
		</Tag>
	);
}
