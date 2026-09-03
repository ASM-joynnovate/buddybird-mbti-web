'use client';

import type { TypeCode } from '@/types/mbti';

import { clamp } from '@/hooks/use-deck-controller';

import { getTypeName } from '@/lib/content/type-infos';

import { type MotionValue, m, useTransform } from 'motion/react';

import { TradingCard } from '@/components/ui/trading-card';

export function DeckCard({
	code,
	index,
	progress,
	isOpen,
	onSelect,
}: {
	code: TypeCode;
	index: number;
	progress: MotionValue<number>;
	isOpen: boolean;
	onSelect: (code: TypeCode) => void;
}) {
	const lift = useTransform(progress, (p) => clamp(p * 2.1 - index * 0.045, 0, 1));
	const y = useTransform(lift, (l) => (1 - l) * 96);
	const scale = useTransform(lift, (l) => 0.82 + 0.18 * l);

	return (
		<m.button
			type="button"
			className="block w-full origin-bottom cursor-pointer p-0"
			style={{ opacity: lift, y, scale }}
			onClick={() => onSelect(code)}
			tabIndex={isOpen ? 0 : -1}
			aria-label={`${code} ${getTypeName(code)}`}
		>
			<TradingCard code={code} compact loading="lazy" />
		</m.button>
	);
}
