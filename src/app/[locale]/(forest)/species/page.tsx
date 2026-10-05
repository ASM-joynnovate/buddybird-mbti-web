import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/content/seo';
import { getLocale, getTranslator } from '@/lib/i18n/server';

import { SpeciesView } from '@/app/[locale]/(forest)/species/_components/species-view';

import { LocaleLink } from '@/components/locale-link';
import { QuestSheet } from '@/components/quest-sheet';

export async function generateMetadata(): Promise<Metadata> {
	return pageMetadata(
		{
			title: '앵무새 종 선택 · 앵BTI',
			description: '우리 앵무새의 종을 골라 앵BTI 테스트를 시작해 보세요.',
			path: '/species',
		},
		await getLocale(),
	);
}

export default async function SpeciesPage() {
	const t = await getTranslator();
	return (
		<SpeciesView>
			<div className="flex items-center">
				<LocaleLink
					href="/"
					prefetch={false}
					aria-label={t('나가기')}
					className="grid size-11 place-items-center rounded-full border-2 border-border-action
						bg-surface-cream font-display text-xl text-primary-active shadow-raise-cream-sm
						transition-transform hover:border-primary hover:bg-cream-hover focus-visible:outline-3
						focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel active:translate-y-0.5
						active:scale-96 active:shadow-raise-bar-action-sm"
				>
					←
				</LocaleLink>
			</div>

			<QuestSheet className="mt-7">
				<h1 className="m-0 font-display text-2xl leading-snug break-keep text-ink">
					{t('우리 앵무새 종은 무엇인가요?')}
				</h1>
				<p className="mt-1.5 text-sm text-ink-muted">{t('종에 따라 성격 성향이 조금씩 반영돼요.')}</p>
			</QuestSheet>
		</SpeciesView>
	);
}
