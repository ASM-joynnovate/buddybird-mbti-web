'use client';

import type { CSSProperties } from 'react';

import type { TypeCode } from '@/types/mbti';

import { typeGradient } from '@/lib/content/gradient';
import { getTypeInfo } from '@/lib/content/type-infos';
import { cardTap } from '@/lib/motion/variants';

import { m, useReducedMotion } from 'motion/react';

import { ParrotImage } from '@/components/ui/parrot-image';

interface MatchCardProps {
	code: TypeCode;
	onSelect: (code: TypeCode) => void;
}

export function MatchCard({ code, onSelect }: MatchCardProps) {
	const reducedMotion = useReducedMotion();
	const info = getTypeInfo(code);
	if (info === null) {
		return null;
	}

	return (
		<m.button
			type="button"
			className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-full border-2
				border-border-action bg-surface-cream py-2 pr-3 pl-2
				shadow-[0_3px_0_var(--color-depth-action),inset_0_2px_0_rgba(255,255,255,0.7)] transition-[border-color]
				duration-150 ease-leaf hover:border-primary focus-visible:outline-3 focus-visible:outline-offset-2
				focus-visible:outline-primary"
			style={{ '--type-grad': typeGradient(code) } as CSSProperties}
			onClick={() => onSelect(code)}
			whileTap={reducedMotion ? undefined : cardTap}
			aria-label={`${code} ${info.name}`}
		>
			<span
				className="grid size-10 flex-none place-items-center overflow-hidden rounded-full
					shadow-[inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.2),0_0_0_2px_#ffffff,0_3px_7px_-3px_rgba(0,0,0,0.4)]
					[background:var(--type-grad)]"
			>
				<ParrotImage type={code} width={38} height={38} className="object-contain" />
			</span>
			<span className="flex min-w-0 flex-col text-left">
				<b className="font-display text-base leading-tight font-normal tracking-wide text-primary-active">
					{code}
				</b>
				<em className="truncate text-xs text-ink-muted not-italic">{info.name}</em>
			</span>
		</m.button>
	);
}
