'use client';

import { useTransition } from 'react';

import type { Axis, AxisScore, TypeCode } from '@/types/mbti';

import { track } from '@/lib/analytics/track';

import { loadImage } from '@/app/[locale]/result/_lib/card/load-image';
import { useLocale, useTranslation } from '@/providers/locale-provider';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { GameButton } from '@/components/ui/button';

interface ShareButtonProps {
	type: TypeCode;
	photoUrl: string | null;
	axisScores: Record<Axis, AxisScore>;
	disabled?: boolean;
}

export function ShareButton({ type, photoUrl, axisScores, disabled = false }: ShareButtonProps) {
	const t = useTranslation();
	const locale = useLocale();
	const [busy, startTransition] = useTransition();

	const handleShare = () => {
		if (busy || photoUrl === null) {
			return;
		}

		startTransition(async () => {
			try {
				const [{ composeCard }, { shareCard }] = await Promise.all([
					import('@/app/[locale]/result/_lib/card/compose-card'),
					import('@/app/[locale]/result/_lib/share-card'),
				]);
				const photo = await loadImage(photoUrl);

				const blob = await composeCard({
					type,
					photo,
					axisScores,
				});

				const outcome = await shareCard(blob, type, locale);
				if (outcome.kind === 'shared') {
					track({ name: 'share_success', payload: { type } });
				} else if (outcome.kind === 'fallback') {
					track({ name: 'share_fallback', payload: { type, reason: outcome.reason } });
					toast(t('카드를 저장했어요. 인스타그램에 올려 주세요!'));
				} else {
					track({ name: 'share_cancel', payload: { type } });
				}
			} catch {
				track({ name: 'share_error', payload: { type } });
				toast(t('카드를 만들지 못했어요. 잠시 후 다시 시도해 주세요.'));
			}
		});
	};

	return (
		<GameButton
			variant="secondary"
			size="sm"
			className="min-h-12 w-full gap-2 px-2.5"
			onClick={handleShare}
			disabled={busy || disabled || photoUrl === null}
		>
			<ImageIcon className="size-5" strokeWidth={2} aria-hidden="true" />
			{busy ? t('카드 만드는 중…') : t('카드 공유하기')}
		</GameButton>
	);
}
