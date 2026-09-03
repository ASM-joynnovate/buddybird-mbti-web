import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { GamePanel } from '@/components/ui/card';

interface QuestSheetProps {
	children: ReactNode;
	className?: string;
	panelClassName?: string;
}

export function QuestSheet({ children, className, panelClassName }: QuestSheetProps) {
	return (
		<div className={cn('relative -rotate-1', className)}>
			<span
				aria-hidden="true"
				className="absolute -top-2.5 left-1/2 z-1 size-5 -translate-x-1/2 rounded-full border-2
					border-primary-active
					bg-[radial-gradient(circle_at_35%_30%,#ffe2c8,var(--color-gold)_55%,var(--color-primary-hover))]
					shadow-[0_3px_4px_rgba(58,46,26,0.35)]"
			/>
			<GamePanel dashedFrame className={cn('px-6 py-6', panelClassName)}>
				{children}
			</GamePanel>
		</div>
	);
}
