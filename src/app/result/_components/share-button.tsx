'use client';

import { useTransition } from 'react';

import type { TypeCode } from '@/types/mbti';

import { track } from '@/lib/analytics/track';
import { parrotImageSrc } from '@/lib/content/assets';
import { typeColors } from '@/lib/content/gradient';
import { getTypeName } from '@/lib/content/type-infos';

import { loadImage } from '@/app/result/_lib/card/load-image';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { GameButton } from '@/components/ui/button';

import appIcon from '@/public/assets/buddybird-app-icon.png';

interface ShareButtonProps {
	type: TypeCode;
	photoUrl: string | null;
	disabled?: boolean;
	isGenerated: boolean;
}

export function ShareButton({ type, photoUrl, isGenerated, disabled = false }: ShareButtonProps) {
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
				const characterSrc = parrotImageSrc(type);
				const [photo, character, icon] = await Promise.all([
					photoUrl !== null ? loadImage(photoUrl) : Promise.resolve(null),
					characterSrc !== undefined ? loadImage(characterSrc).catch(() => null) : Promise.resolve(null),
					loadImage(appIcon.src).catch(() => null),
				]);

				const blob = await composeCard({
					type,
					typeName: getTypeName(type),
					photo,
					isGenerated,
					character,
					colors: typeColors(type),
					appIcon: icon,
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
		<GameButton
			variant="secondary"
			size="sm"
			className="min-h-12 w-full gap-2 px-2.5"
			onClick={handleShare}
			disabled={busy || disabled}
		>
			<ImageIcon className="size-5" strokeWidth={2} aria-hidden="true" />
			{busy ? '카드 만드는 중…' : '카드 공유하기'}
		</GameButton>
	);
}
