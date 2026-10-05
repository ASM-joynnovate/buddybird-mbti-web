import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/content/seo';
import { getLocale } from '@/lib/i18n/server';

import { TestView } from '@/app/[locale]/(forest)/test/_components/test-view';

export async function generateMetadata(): Promise<Metadata> {
	return pageMetadata(
		{
			title: '앵BTI 테스트 · 버디버드',
			description: '우리 앵무새를 떠올리며 질문에 답하면 1분 만에 우리 아이의 진짜 성격이 나와요.',
			path: '/test',
		},
		await getLocale(),
	);
}

export default function TestPage() {
	return <TestView />;
}
