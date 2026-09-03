'use client';

import { useTransition } from 'react';

import type { TypeCode } from '@/types/mbti';

import { track } from '@/lib/analytics/track';
import { parrotImageSrc } from '@/lib/content/assets';
import { typeColors } from '@/lib/content/gradient';
import { getTypeInfo, getTypeName } from '@/lib/content/type-infos';

import { loadImage } from '@/app/result/_lib/card/load-image';
import { toast } from 'sonner';

import { GameButton } from '@/components/ui/button';

interface ShareButtonProps {
	type: TypeCode;
	photoUrl: string | null;
}

export function ShareButton({ type, photoUrl }: ShareButtonProps) {
	const [busy, startTransition] = useTransition();

	const handleShare = () => {
		if (busy) {
			return;
		}

		startTransition(async () => {
			try {
				const [{ composeCard }, { shareCard }] = await Promise.all([
					import('@/app/result/_lib/card/compose-card'),
					import('@/app/result/_lib/share-card'),
				]);
				const info = getTypeInfo(type);
				const [photo, character] = await Promise.all([
					photoUrl !== null ? loadImage(photoUrl).catch(() => null) : Promise.resolve(null),
					loadImage(parrotImageSrc(type)).catch(() => null),
				]);

				const blob = await composeCard({
					type,
					typeName: getTypeName(type),
					copy: info?.report ?? '',
					photo,
					character,
					colors: typeColors(type),
				});

				const outcome = await shareCard(blob, type);
				if (outcome.kind === 'shared') {
					track({ name: 'share_success', payload: { type } });
				} else if (outcome.kind === 'fallback') {
					track({ name: 'share_fallback', payload: { type, reason: outcome.reason } });
					toast('카드를 저장했어요. 인스타그램에 올려 주세요!');
				} else {
					track({ name: 'share_cancel', payload: { type } });
				}
			} catch {
				track({ name: 'share_error', payload: { type } });
				toast('카드를 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
			}
		});
	};

	return (
		<GameButton variant="secondary" size="sm" className="w-full" onClick={handleShare} disabled={busy}>
			{busy ? '카드 만드는 중…' : '친구에게 공유하기'} <span aria-hidden="true">↗</span>
		</GameButton>
	);
}
