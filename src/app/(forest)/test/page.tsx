import type { Metadata } from 'next';

import { TestView } from '@/app/(forest)/test/_components/test-view';

export const metadata: Metadata = {
	title: '앵BTI 테스트 · 버디버드',
	description: '우리 앵무새를 떠올리며 질문에 답하면 1분 만에 우리 아이의 진짜 성격이 나와요.',
};

export default function TestPage() {
	return <TestView />;
}
