'use client';

import type { TypeCode } from '@/types/mbti';

import { GROUP_CSS_VAR, type TemperamentGroup, temperamentGroup } from '@/lib/mbti/temperament';

import { useTranslation } from '@/providers/locale-provider';

import styles from './result-card-preview.module.css';

interface ResultCardPreviewProps {
	type: TypeCode;
	cardUrl: string;
	sample: boolean;
}

const GROUP_LABEL: Record<TemperamentGroup, string> = {
	Analysts: '분석가형',
	Diplomats: '외교관형',
	Sentinels: '관리자형',
	Explorers: '탐험가형',
};

export function ResultCardPreview({ type, cardUrl, sample }: ResultCardPreviewProps) {
	const t = useTranslation();

	const group = temperamentGroup(type);
	const groupBadge = (
		<span className={styles.group} style={{ background: GROUP_CSS_VAR[group] }}>
			{t(GROUP_LABEL[group])}
		</span>
	);

	return (
		<section className={styles.section} aria-label={t('완성된 앵BTI 카드')}>
			<div className={styles.intro}>
				<h1>{t(sample ? '🎉 앵BTI 카드 완성!' : '🎉 우리 앵이의 앵BTI는?!')}</h1>
			</div>

			<div className={styles.stage}>
				<span className={styles.backdropOne} aria-hidden="true" />
				<span className={styles.backdropTwo} aria-hidden="true" />
				<div className={styles.cardWrap}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img className={styles.cardImage} src={cardUrl} alt={t('완성된 앵BTI 카드')} />
				</div>
			</div>

			<div className={styles.foot}>
				{sample ? (
					<p className={styles.shareHint}>
						{t('다운로드하고')} <strong>{t('인스타 스토리')}</strong>
						{t('에 공유해 보세요!')}
					</p>
				) : (
					groupBadge
				)}
			</div>
		</section>
	);
}
