import { Suspense } from 'react';

import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/content/seo';
import { getLocale, getTranslator } from '@/lib/i18n/server';

import { ResultView } from '@/app/[locale]/result/_components/result-view';

// noindex: a bare /result client-redirects to home; only shared /result?t=… links
// are meaningful. Share previews still work — OG/Twitter scrapers ignore robots.
export async function generateMetadata(): Promise<Metadata> {
	return pageMetadata(
		{
			title: '내 앵BTI 결과 · 버디버드',
			description:
				'우리 앵무새의 앵BTI 결과 카드가 도착했어요. 16가지 유형 중 우리 아이의 진짜 성격을 확인해 보세요.',
			path: '/result',
			index: false,
		},
		await getLocale(),
	);
}

export default async function ResultPage() {
	const t = await getTranslator();
	return (
		<Suspense fallback={<div>{t('불러오는 중…')}</div>}>
			<ResultView />
		</Suspense>
	);
}
