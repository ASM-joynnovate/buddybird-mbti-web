'use client';

import { useEffect, useState } from 'react';

import type { Axis, AxisScore, TypeCode } from '@/types/mbti';

import { track } from '@/lib/analytics/track';
import { localizedPath } from '@/lib/i18n/path';
import { RESULT_PARAM, encodeResult } from '@/lib/result-url';

import { useLocale, useTranslation } from '@/providers/locale-provider';
import { CheckIcon, LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

import { GameButton } from '@/components/ui/button';

interface LinkCopyButtonProps {
	type: TypeCode;
	axisScores: Record<Axis, AxisScore>;
}

const COPIED_MS = 1800;

export function LinkCopyButton({ type, axisScores }: LinkCopyButtonProps) {
	const t = useTranslation();
	const locale = useLocale();
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), COPIED_MS);
		return () => clearTimeout(timer);
	}, [copied]);

	const handleCopy = async () => {
		// Link previews are fetched by crawlers, which get Korean on the locale-less URL.
		const path = localizedPath('/result', locale);
		const url = `${window.location.origin}${path}?${RESULT_PARAM}=${encodeResult(type, axisScores)}`;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			track({ name: 'link_copied', payload: { type } });
			toast(t('링크를 복사했어요'));
		} catch {
			toast(t('링크를 복사하지 못했어요. 주소창의 링크를 복사해 주세요.'));
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
