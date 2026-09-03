import { Suspense } from 'react';

import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/content/seo';

import { ResultView } from '@/app/result/_components/result-view';

export const metadata: Metadata = pageMetadata({
	title: '내 앵BTI 결과 · 버디버드',
	description: '우리 앵무새의 앵BTI 결과 카드가 도착했어요. 16가지 유형 중 우리 아이의 진짜 성격을 확인해 보세요.',
	path: '/result',
});

export default function ResultPage() {
	return (
		<Suspense fallback={<div>불러오는 중…</div>}>
			<ResultView />
		</Suspense>
	);
}
