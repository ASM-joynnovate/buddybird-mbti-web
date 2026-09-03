import type { Metadata } from 'next';
import Link from 'next/link';

import { SpeciesView } from '@/app/(forest)/species/_components/species-view';

import { QuestSheet } from '@/components/quest-sheet';

export const metadata: Metadata = {
	title: '앵무새 종 선택 · 앵BTI',
};

export default function SpeciesPage() {
	return (
		<SpeciesView>
			<div className="flex items-center">
				<Link
					href="/"
					prefetch={false}
					aria-label="나가기"
					className="grid size-11 place-items-center rounded-full border-2 border-border-action
						bg-surface-cream font-display text-xl text-primary-active shadow-raise-cream-sm
						transition-transform hover:border-primary hover:bg-cream-hover focus-visible:outline-3
						focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel active:translate-y-0.5
						active:scale-96 active:shadow-raise-bar-action-sm"
				>
					←
				</Link>
			</div>

			<QuestSheet className="mt-7">
				<h1 className="m-0 font-display text-2xl leading-snug break-keep text-ink">
					우리 앵무새 종은 무엇인가요?
				</h1>
				<p className="mt-1.5 text-sm text-ink-muted">종에 따라 성격 성향이 조금씩 반영돼요.</p>
			</QuestSheet>
		</SpeciesView>
	);
}
