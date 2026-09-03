import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { cn } from '@/lib/utils';

const cardClass =
	'relative rounded-panel border-[length:var(--border-panel)] border-border-action bg-surface-cream text-ink shadow-raise-panel';
const dashedFrameClass =
	'before:pointer-events-none before:absolute before:inset-1.5 before:rounded-lg before:border-[length:var(--border-hair)] before:border-dashed before:border-[color-mix(in_srgb,var(--color-primary)_28%,var(--color-surface-cream))] before:content-[""]';

type CardProps = ComponentPropsWithoutRef<'div'> & {
	as?: Extract<ElementType, 'div' | 'section'>;
	dashedFrame?: boolean;
};

function Card({ as: Tag = 'div', className, dashedFrame = false, ...props }: CardProps) {
	return <Tag data-slot="card" className={cn(cardClass, dashedFrame && dashedFrameClass, className)} {...props} />;
}

const GamePanel = Card;

export { Card, GamePanel };
