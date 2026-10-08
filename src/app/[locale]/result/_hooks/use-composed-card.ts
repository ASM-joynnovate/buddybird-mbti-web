'use client';

import { useEffect, useState } from 'react';

import type { Axis, AxisScore, TypeCode } from '@/types/mbti';

import { loadImage } from '@/app/[locale]/result/_lib/card/load-image';

interface CardState {
	photoUrl: string;
	type: TypeCode;
	axisScores: Record<Axis, AxisScore>;
	url: string | null;
	error: boolean;
}

export function useComposedCard(
	photoUrl: string | null,
	type: TypeCode | null,
	axisScores: Record<Axis, AxisScore> | null,
) {
	const [state, setState] = useState<CardState | null>(null);

	useEffect(() => {
		if (photoUrl === null || type === null || axisScores === null) return;
		let disposed = false;
		let objectUrl: string | null = null;

		const build = async () => {
			try {
				const [{ composeCard }, photo] = await Promise.all([
					import('@/app/[locale]/result/_lib/card/compose-card'),
					loadImage(photoUrl),
				]);
				const card = await composeCard({ type, photo, axisScores });
				if (disposed) return;
				objectUrl = URL.createObjectURL(card);
				setState({ photoUrl, type, axisScores, url: objectUrl, error: false });
			} catch {
				if (!disposed) setState({ photoUrl, type, axisScores, url: null, error: true });
			}
		};

		void build();
		return () => {
			disposed = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [photoUrl, type, axisScores]);

	const current =
		state?.photoUrl === photoUrl && state?.type === type && state?.axisScores === axisScores ? state : null;
	return { url: current?.url ?? null, error: current?.error ?? false };
}
