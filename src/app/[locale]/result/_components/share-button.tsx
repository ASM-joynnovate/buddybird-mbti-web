'use client';

import { useTransition } from 'react';

import type { TypeCode } from '@/types/mbti';

import { track } from '@/lib/analytics/track';

import { shareCard } from '@/app/[locale]/result/_lib/share-card';
import { useLocale, useTranslation } from '@/providers/locale-provider';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { GameButton } from '@/components/ui/button';

interface ShareButtonProps {
	type: TypeCode;
	card: Blob | null;
	pending?: boolean;
	onManualSave?: () => void;
}

export function ShareButton({ type, card, pending = false, onManualSave }: ShareButtonProps) {
	const t = useTranslation();
	const locale = useLocale();
	const [busy, startTransition] = useTransition();

	const handleShare = () => {
		if (busy || card === null) {
			return;
		}

		// 화면에 표시된 카드를 그대로 공유한다. 누른 직후 navigator.share를 호출해야 브라우저가 사용자 동작으로 인정한다.
		startTransition(async () => {
			try {
				const outcome = await shareCard(card, type, locale);
				if (outcome.kind === 'shared') {
					track({ name: 'share_success', payload: { type } });
				} else if (outcome.kind === 'fallback') {
					track({ name: 'share_fallback', payload: { type, reason: outcome.reason } });
					toast(t('카드를 저장했어요. 인스타그램에 올려 주세요!'));
				} else if (outcome.kind === 'manual-save') {
					track({ name: 'share_fallback', payload: { type, reason: `in-app-browser:${outcome.reason}` } });
					onManualSave?.();
					toast(t('카드 이미지를 길게 눌러 저장해 주세요.'));
				} else {
					track({ name: 'share_cancel', payload: { type } });
				}
			} catch {
				track({ name: 'share_error', payload: { type } });
				toast(t('카드를 공유하지 못했어요. 잠시 후 다시 시도해 주세요.'));
			}
		});
	};

	return (
		<GameButton
			variant="secondary"
			size="sm"
			className="min-h-12 w-full gap-2 px-2.5"
			onClick={handleShare}
			disabled={busy || card === null}
		>
			<ImageIcon className="size-5" strokeWidth={2} aria-hidden="true" />
			{pending ? t('카드 만드는 중…') : t('카드 공유하기')}
		</GameButton>
	);
}
