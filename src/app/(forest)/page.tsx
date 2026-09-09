import type { Metadata } from 'next';

import { QUESTION_COUNT } from '@/lib/content/questions';
import { pageMetadata } from '@/lib/content/seo';

import { IntroView } from '@/app/(forest)/_components/intro-view';

import { GamePill } from '@/components/ui/badge';

export const metadata: Metadata = pageMetadata({
	title: '앵BTI · 버디버드',
	description: '우리 앵무새의 성격은? 12문항으로 알아보는 앵BTI 테스트.',
	path: '/',
});

export default function HomePage() {
	return (
		<IntroView
			heading={
				<h1
					className="isolate m-0 font-display text-[clamp(2.125rem,11vw,2.875rem)] leading-[1.08] text-ink
						[text-shadow:0_2px_0_var(--color-surface-cream),0_0_16px_rgba(255,248,227,0.9)]"
				>
					우리 앵무새
					<br />
					<span className="whitespace-nowrap">
						<span
							className="relative whitespace-nowrap text-primary-active after:absolute after:-right-[4%]
								after:bottom-[4%] after:-left-[4%] after:-z-10 after:h-2/5 after:-rotate-2
								after:rounded-full
								after:bg-[linear-gradient(180deg,var(--color-primary-glow),var(--color-gold))]
								after:opacity-85 after:content-['']"
						>
							진짜 성격
						</span>
						은?
					</span>
				</h1>
			}
			stats={
				<GamePill
					bare
					className="items-stretch gap-[clamp(0.625rem,4vw,1.125rem)] px-[clamp(1rem,6vw,1.625rem)] py-3
						text-sm font-semibold text-ink-muted"
				>
					<span className="flex flex-col items-center whitespace-nowrap">
						<b className="font-display text-xl leading-none font-normal text-primary">16</b>
						유형
					</span>
					<i className="w-0.5 rounded-xs bg-border-action" aria-hidden="true" />
					<span className="flex flex-col items-center whitespace-nowrap">
						<b className="font-display text-xl leading-none font-normal text-primary">{QUESTION_COUNT}</b>
						질문
					</span>
					<i className="w-0.5 rounded-xs bg-border-action" aria-hidden="true" />
					<span className="flex flex-col items-center whitespace-nowrap">
						<b className="font-display text-xl leading-none font-normal text-primary">1분</b>
						소요
					</span>
				</GamePill>
			}
		/>
	);
}
