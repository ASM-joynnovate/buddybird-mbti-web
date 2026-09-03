'use client';

import type { TypeCode } from '@/types/mbti';

import { trackEvent } from '@/lib/analytics/track';
import { getTypeInfo } from '@/lib/content/type-infos';
import { buttonTap, durationFast, easeSpring } from '@/lib/motion/variants';

import { type Variants, m, useReducedMotion } from 'motion/react';

import { Badge } from '@/components/ui/badge';
import { GameButton, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PortraitWindow } from '@/components/ui/portrait-window';
import { Separator } from '@/components/ui/separator';

const cardPop: Variants = {
	hidden: { opacity: 0, scale: 0.9, y: 10 },
	visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.36, ease: easeSpring } },
	exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: durationFast } },
};
const reducedFade: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.12 } },
	exit: { opacity: 0, transition: { duration: 0.08 } },
};

interface DetailDialogProps {
	code: TypeCode;
	onClose: () => void;
	onSelectType?: (code: TypeCode) => void;
	cta?: { label: string; onClick: () => void };
}

export function DetailDialog({ code, onClose, onSelectType, cta }: DetailDialogProps) {
	const reducedMotion = useReducedMotion();
	const info = getTypeInfo(code);

	if (info === null) {
		return null;
	}

	return (
		<Dialog
			open
			onOpenChange={(open, eventDetails) => {
				if (open) {
					return;
				}
				const method =
					eventDetails.reason === 'escape-key'
						? 'escape'
						: eventDetails.reason === 'outside-press'
							? 'scrim'
							: 'button';
				trackEvent('detail_close', { method });
				onClose();
			}}
		>
			<DialogContent
				render={
					<m.div
						variants={reducedMotion ? reducedFade : cardPop}
						initial="hidden"
						animate="visible"
						exit="exit"
					/>
				}
				aria-label={`${code} ${info.name}`}
				className="flex max-h-[calc(100dvh-2.75rem)] w-[calc(100%-2.75rem)] max-w-md flex-col rounded-card
					bg-(image:--gradient-card-frame) p-1.5
					shadow-[0_8px_0_var(--color-primary-active),0_26px_50px_-16px_rgba(20,12,6,0.7),inset_0_2px_0_rgba(255,255,255,0.5)]"
			>
				<DialogClose
					render={<m.button whileTap={reducedMotion ? undefined : buttonTap} />}
					className={buttonVariants({
						variant: 'icon',
						size: 'sm',
						className: 'absolute top-3.5 right-3.5 z-4',
					})}
					aria-label="닫기"
				>
					✕
				</DialogClose>

				<PortraitWindow code={code} imgSize={190} variant="hero" className="h-50 flex-none rounded-t-lg">
					<span
						className="absolute bottom-3 left-4 z-3 font-display text-5xl leading-[0.9] tracking-wider
							text-white [text-shadow:0_3px_10px_rgba(0,0,0,0.45)]"
						aria-hidden="true"
					>
						{code}
					</span>
				</PortraitWindow>

				<div
					className="min-h-0 flex-1 overflow-y-auto rounded-b-lg border-[length:var(--border-hair)] border-t-0
						border-white bg-surface-cream px-4 pt-4 pb-4 [-webkit-overflow-scrolling:touch]"
				>
					<DialogTitle className="m-0 font-display text-xl text-primary-active">{info.name}</DialogTitle>
					<Separator aria-hidden="true" variant="dashed" className="my-3" />
					<p className="m-0 mb-4 text-sm leading-relaxed break-keep text-ink">{info.description}</p>

					{info.match.length > 0 && (
						<div
							className="mb-4 flex items-center gap-3 rounded-md border-2 border-border-action bg-white
								px-3.5 py-3
								shadow-[0_3px_0_var(--color-depth-action),inset_0_2px_0_rgba(255,255,255,0.9)]"
						>
							<span className="flex-none font-display text-sm whitespace-nowrap text-primary-active">
								찰떡궁합
							</span>
							<div className="ml-auto flex gap-2">
								{info.match.map((matchCode) =>
									onSelectType !== undefined ? (
										<Badge
											key={matchCode}
											variant="orange"
											render={<button type="button" />}
											className="cursor-pointer
												active:shadow-[0_1px_0_var(--color-primary-active)]"
											onClick={() => onSelectType(matchCode)}
										>
											{matchCode}
										</Badge>
									) : (
										<Badge key={matchCode} variant="orange">
											{matchCode}
										</Badge>
									),
								)}
							</div>
						</div>
					)}

					{cta !== undefined && (
						<GameButton variant="primary" size="sm" className="w-full" onClick={cta.onClick}>
							{cta.label}
						</GameButton>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
