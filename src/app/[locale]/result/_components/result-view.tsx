'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import type { TypeCode } from '@/types/mbti';

import { useDeckController } from '@/hooks/use-deck-controller';

import { trackEvent } from '@/lib/analytics/track';
import { withTrack } from '@/lib/analytics/with-track';
import { typeGradient } from '@/lib/content/gradient';
import { getTypeInfo, getTypeName } from '@/lib/content/type-infos';
import { currentLocalePath } from '@/lib/i18n/path';
import { fadeOnly, fadeUp, staggerContainer } from '@/lib/motion/variants';
import { RESULT_PARAM, decodeResult, fallbackScores } from '@/lib/result-url';

import { AppCtaButton } from '@/app/[locale]/result/_components/app-cta-button';
import { AxisBars } from '@/app/[locale]/result/_components/axis-bars';
import { Confetti } from '@/app/[locale]/result/_components/confetti';
import { GenerationProgress } from '@/app/[locale]/result/_components/generation-progress';
import { LinkCopyButton } from '@/app/[locale]/result/_components/link-copy-button';
import { MatchCard } from '@/app/[locale]/result/_components/match-card';
import { PhotoInput } from '@/app/[locale]/result/_components/photo-input';
import { ResultCardDisplay } from '@/app/[locale]/result/_components/result-card-display';
import { ResultPolaroid } from '@/app/[locale]/result/_components/result-polaroid';
import { ShareButton } from '@/app/[locale]/result/_components/share-button';
import { Marker, emphasize } from '@/app/[locale]/result/_components/ui/emphasize';
import { useComposedCard } from '@/app/[locale]/result/_hooks/use-composed-card';
import { useGeneratedPhoto } from '@/app/[locale]/result/_hooks/use-generated-photo';
import { useTranslation } from '@/providers/locale-provider';
import { useTestProgress } from '@/providers/test-progress-provider';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

import { DeckOverlay } from '@/components/deck-overlay/deck-overlay-lazy';
import { DetailDialog } from '@/components/detail-dialog-lazy';
import { GameButton } from '@/components/ui/button';
import { GamePanel } from '@/components/ui/card';

const PAPER_CLASS = 'relative min-h-dvh bg-[radial-gradient(130%_80%_at_50%_0%,#fff6e0_0%,#f4e7cb_70%,#efdfbf_100%)]';

export function ResultView() {
	const t = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { result, reset } = useTestProgress();
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const reducedMotion = useReducedMotion();

	const deck = useDeckController('result');
	const [detail, setDetail] = useState<TypeCode | null>(null);

	const rise = reducedMotion ? fadeOnly : fadeUp;

	const handleRestart = () => {
		reset();
		router.push(currentLocalePath('/'));
	};

	const ownType = result?.type ?? null;
	const resultParam = searchParams.get(RESULT_PARAM);
	const decoded = useMemo(() => decodeResult(resultParam), [resultParam]);
	const type = ownType ?? decoded?.type ?? null;
	const axisScores = useMemo(
		() => (type === null ? null : (result?.axisScores ?? decoded?.axisScores ?? fallbackScores(type))),
		[type, result?.axisScores, decoded?.axisScores],
	);
	const generated = useGeneratedPhoto(photoFile, type);
	const composedCard = useComposedCard(generated.url, type, axisScores);
	const cardDisplayRef = useRef<HTMLDivElement>(null);
	const lastScrolledCardUrl = useRef<string | null>(null);
	useEffect(() => {
		if (composedCard.url === null || lastScrolledCardUrl.current === composedCard.url) return;
		lastScrolledCardUrl.current = composedCard.url;
		cardDisplayRef.current?.scrollIntoView({
			behavior: reducedMotion ? 'auto' : 'smooth',
			block: 'start',
		});
	}, [composedCard.url, reducedMotion]);
	const entryHandled = useRef(false);
	useEffect(() => {
		if (entryHandled.current) return;
		entryHandled.current = true;
		if (type !== null) {
			trackEvent('result_view', { type, visitor: ownType !== null ? 'owner' : 'shared' });
		} else {
			trackEvent('result_error', { reason: resultParam === null ? 'missing' : 'invalid' });
			router.replace(currentLocalePath('/'));
		}
	}, [type, ownType, resultParam, router]);

	if (type === null || axisScores === null) {
		return <main className={PAPER_CLASS} />;
	}

	const info = getTypeInfo(type);

	return (
		<main className={PAPER_CLASS}>
			<Confetti />
			<m.div variants={staggerContainer} initial="hidden" animate="visible">
				<m.header
					className="relative flex flex-col items-center px-gutter pt-14 pb-2 text-center"
					variants={staggerContainer}
				>
					<m.p className="relative z-1 m-0 font-display text-lg text-primary-active" variants={rise}>
						{t('🎉 우리 앵이의 앵BTI는?!')}
					</m.p>
					<m.div className="relative z-1 my-4 w-full" variants={rise}>
						<ResultPolaroid
							type={type}
							name={t(getTypeName(type))}
							gradient={typeGradient(type)}
							photoUrl={null}
							reducedMotion={reducedMotion === true}
						/>
					</m.div>
					{composedCard.url !== null && (
						<m.div ref={cardDisplayRef} className="relative z-1 mt-8 w-full scroll-mt-5" variants={rise}>
							<ResultCardDisplay cardUrl={composedCard.url} />
						</m.div>
					)}
				</m.header>

				<m.div className="flex flex-col gap-4 px-gutter pt-5 pb-9" variants={staggerContainer}>
					<m.div className="flex flex-col gap-3" variants={rise}>
						{!generated.url && !generated.busy && (
							<PhotoInput
								type={type}
								onPick={(file) => {
									setPhotoFile(file);
									void generated.generate(file);
								}}
							/>
						)}
						{generated.busy && <GenerationProgress />}
						<div className="grid grid-cols-2 gap-2.5">
							<ShareButton
								type={type}
								photoUrl={generated.url}
								axisScores={axisScores}
								disabled={generated.busy}
							/>
							<LinkCopyButton type={type} />
						</div>
						{generated.error && (
							<div role="status" aria-live="polite" className="text-center text-sm text-ink-muted">
								{t(generated.error)}
							</div>
						)}
						{composedCard.error && (
							<div role="status" aria-live="polite" className="text-center text-sm text-ink-muted">
								{t('카드를 표시하지 못했어요. 새로고침해 주세요.')}
							</div>
						)}
						<AppCtaButton placement="result" />
					</m.div>

					{info !== null && (
						<m.div variants={rise}>
							<GamePanel as="section" aria-label={t('앵BTI 성격 분석')} className="px-4 pt-4 pb-5">
								<h2 className="m-0 mb-4 font-display text-lg font-normal text-ink">
									<Marker variant="head">{t('앵BTI 성격 분석')}</Marker>
								</h2>
								<p className="m-0 mb-3.5 font-display text-lg leading-normal break-keep text-ink">
									<Marker variant="lead">{t(info.report)}</Marker>
								</p>
								<p className="m-0 text-sm leading-relaxed break-keep text-ink">
									{emphasize(t(info.description))}
								</p>
							</GamePanel>
						</m.div>
					)}

					<m.div variants={rise}>
						<AxisBars axisScores={axisScores} />
					</m.div>

					{info !== null && info.match.length > 0 && (
						<m.div variants={rise}>
							<GamePanel as="section" aria-label={t('환상의 궁합')} className="px-4 pt-4 pb-5">
								<h2 className="m-0 mb-4 font-display text-lg font-normal text-ink">
									🤝 <Marker variant="head">{t('환상의 궁합')}</Marker>
								</h2>
								<div className="flex flex-col gap-3">
									{info.match.map((matchCode) => (
										<MatchCard
											key={matchCode}
											code={matchCode}
											onSelect={withTrack(
												'detail_open',
												(code: TypeCode) => ({
													type: code,
													source: 'match',
												}),
												setDetail,
											)}
										/>
									))}
								</div>
							</GamePanel>
						</m.div>
					)}

					<m.div className="mt-1 flex gap-3" variants={rise}>
						<GameButton variant="secondary" className="flex-1" onClick={deck.openAnimated}>
							{t('🗂 앵BTI 유형 보기')}
						</GameButton>
						<GameButton
							variant="secondary"
							className="flex-1"
							onClick={withTrack('restart_click', { source: 'owner' }, handleRestart)}
						>
							{t('↺ 다시하기')}
						</GameButton>
					</m.div>
				</m.div>
			</m.div>

			<DeckOverlay
				controller={deck}
				onSelect={withTrack('detail_open', (code: TypeCode) => ({ type: code, source: 'deck' }), setDetail)}
			/>
			<AnimatePresence>
				{detail !== null && (
					<DetailDialog
						code={detail}
						onClose={() => setDetail(null)}
						onSelectType={withTrack(
							'detail_open',
							(code: TypeCode) => ({ type: code, source: 'chip' }),
							setDetail,
						)}
					/>
				)}
			</AnimatePresence>
		</main>
	);
}
