'use client';

import { useTranslation } from '@/providers/locale-provider';

import { Marker } from '@/app/[locale]/result/_components/ui/emphasize';

import styles from './result-card-preview.module.css';

interface ResultCardPreviewProps {
	cardUrl: string;
}

export function ResultCardPreview({ cardUrl }: ResultCardPreviewProps) {
	const t = useTranslation();

	return (
		<section className={styles.section} aria-label={t('완성된 앵BTI 카드')}>
			<div className={styles.intro}>
				<h1>
					<Marker variant="head">{t('🎉 앵BTI 카드 완성!')}</Marker>
				</h1>
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
				<p className={styles.shareHint}>{t('SNS 스토리에 공유해 보세요!')}</p>
			</div>
		</section>
	);
}
