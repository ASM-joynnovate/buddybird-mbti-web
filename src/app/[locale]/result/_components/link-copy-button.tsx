'use client';

import { useEffect, useState } from 'react';

import type { TypeCode } from '@/types/mbti';

import { track } from '@/lib/analytics/track';
import { RESULT_COPY_URL } from '@/lib/content/invite-link';

import { useTranslation } from '@/providers/locale-provider';
import { CheckIcon, LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

import { GameButton } from '@/components/ui/button';

interface LinkCopyButtonProps {
	type: TypeCode;
}

const COPIED_MS = 1800;
const SHARE_TEXT = `우리 앵무새 앵BTI는?! 🦜

앵이의 진짜 성격을 확인하고, 사진을 넣어 귀여운 카드도 만들어보세요!
${RESULT_COPY_URL}`;

export function LinkCopyButton({ type }: LinkCopyButtonProps) {
	const t = useTranslation();
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), COPIED_MS);
		return () => clearTimeout(timer);
	}, [copied]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(SHARE_TEXT);
			setCopied(true);
			track({ name: 'link_copied', payload: { type } });
			toast(t('앵BTI 링크를 복사했어요. 친구에게 보내 보세요!'));
		} catch {
			toast(t('링크를 복사하지 못했어요. 다시 시도해 주세요.'));
		}
	};

	return (
		<GameButton variant="secondary" size="sm" className="min-h-12 w-full gap-2 px-2.5" onClick={handleCopy}>
			{copied ? (
				<CheckIcon className="size-5" strokeWidth={2.5} aria-hidden="true" />
			) : (
				<LinkIcon className="size-5" strokeWidth={2} aria-hidden="true" />
			)}
			<span aria-live="polite">{copied ? t('복사했어요') : t('링크 복사')}</span>
		</GameButton>
	);
}
