'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import type { TypeCode } from '@/types/mbti';

import { useDeckController } from '@/hooks/use-deck-controller';

import { trackEvent } from '@/lib/analytics/track';
import { withTrack } from '@/lib/analytics/with-track';
import { typeGradient } from '@/lib/content/gradient';
import { getTypeInfo, getTypeName } from '@/lib/content/type-infos';
import { GROUP_CSS_VAR, type TemperamentGroup, temperamentGroup } from '@/lib/mbti/temperament';
import { easeSpring, fadeOnly, fadeUp, staggerContainer } from '@/lib/motion/variants';
import { RESULT_PARAM, decodeResult, fallbackScores } from '@/lib/result-url';

import { AppCtaButton } from '@/app/result/_components/app-cta-button';
import { AxisBars } from '@/app/result/_components/axis-bars';
import { Confetti } from '@/app/result/_components/confetti';
import { MatchCard } from '@/app/result/_components/match-card';
import { PhotoInput } from '@/app/result/_components/photo-input';
import { ResultPolaroid } from '@/app/result/_components/result-polaroid';
import { ShareButton } from '@/app/result/_components/share-button';
import { Marker, emphasize } from '@/app/result/_components/ui/emphasize';
import { usePhotoSource } from '@/app/result/_hooks/use-photo-source';
import { useTestProgress } from '@/providers/test-progress-provider';
import { AnimatePresence, type Variants, m, useReducedMotion } from 'motion/react';

import { DeckOverlay } from '@/components/deck-overlay/deck-overlay-lazy';
import { DetailDialog } from '@/components/detail-dialog-lazy';
import { GameButton } from '@/components/ui/button';
import { GamePanel } from '@/components/ui/card';

const heroArtRise: Variants = {
	hidden: { opacity: 0, y: 40, scale: 0.9 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.55, ease: easeSpring },
	},
};

const GROUP_LABEL: Record<TemperamentGroup, string> = {
	Analysts: '분석가형',
	Diplomats: '외교관형',
	Sentinels: '관리자형',
	Explorers: '탐험가형',
};

const PAPER_CLASS = 'relative min-h-dvh bg-[radial-gradient(130%_80%_at_50%_0%,#fff6e0_0%,#f4e7cb_70%,#efdfbf_100%)]';

export function ResultView() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { result, reset } = useTestProgress();
	const photo = usePhotoSource();
	const reducedMotion = useReducedMotion();

	const deck = useDeckController('result');
	const [detail, setDetail] = useState<TypeCode | null>(null);

	const rise = reducedMotion ? fadeOnly : fadeUp;
	const art = reducedMotion ? fadeOnly : heroArtRise;

	const handleRestart = () => {
		reset();
		router.push('/');
	};

	const ownType = result?.type ?? null;
	const resultParam = searchParams.get(RESULT_PARAM);
	const decoded = decodeResult(resultParam);
	const type = ownType ?? decoded?.type ?? null;

	const entryHandled = useRef(false);
	useEffect(() => {
		if (entryHandled.current) return;
		entryHandled.current = true;
		if (type !== null) {
			trackEvent('result_view', { type, visitor: ownType !== null ? 'owner' : 'shared' });
		} else {
			trackEvent('result_error', { reason: resultParam === null ? 'missing' : 'invalid' });
			router.replace('/');
		}
	}, [type, ownType, resultParam, router]);

	if (type === null) {
		return <main className={PAPER_CLASS} />;
	}

	const info = getTypeInfo(type);
	const group = temperamentGroup(type);
	const axisScores = result?.axisScores ?? decoded?.axisScores ?? fallbackScores(type);

	const gradient = typeGradient(type);

	return (
		<main className={PAPER_CLASS}>
			<Confetti />

			<m.div variants={staggerContainer} initial="hidden" animate="visible">
				<m.header
					className="relative flex flex-col items-center px-gutter pt-14 pb-2 text-center"
					variants={staggerContainer}
				>
					<m.p className="relative z-1 m-0 font-display text-lg text-primary-active" variants={rise}>
						🎉 나의 앵무새 성격은
					</m.p>

					<m.div className="relative z-1 my-4 w-full" variants={art}>
						<ResultPolaroid
							type={type}
							name={getTypeName(type)}
							gradient={gradient}
							photoUrl={photo.objectUrl}
							reducedMotion={reducedMotion === true}
						/>
					</m.div>

					<m.span
						className="relative z-1 rounded-full border-[length:var(--border-hair)] border-white/70 px-4
							py-1.5 font-display text-sm whitespace-nowrap text-white
							shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_10px_-4px_rgba(0,0,0,0.4)]"
						style={{ background: GROUP_CSS_VAR[group] }}
						variants={rise}
					>
						{GROUP_LABEL[group]}
					</m.span>
				</m.header>

				<m.div className="flex flex-col gap-4 px-gutter pt-5 pb-9" variants={staggerContainer}>
					<m.div className="flex flex-col gap-3" variants={rise}>
						<GamePanel className="px-4 py-4">
							<PhotoInput objectUrl={photo.objectUrl} onPick={photo.setFile} onClear={photo.clear} />
						</GamePanel>
						<ShareButton type={type} photoUrl={photo.objectUrl} />
						<AppCtaButton placement="result" />
					</m.div>

					{info !== null && (
						<m.div variants={rise}>
							<GamePanel as="section" aria-label="성격 분석" className="px-4 pt-4 pb-5">
								<h2 className="m-0 mb-4 font-display text-lg font-normal text-ink">
									<Marker variant="head">성격 분석</Marker>
								</h2>
								<p className="m-0 mb-3.5 font-display text-lg leading-normal break-keep text-ink">
									<Marker variant="lead">{info.report}</Marker>
								</p>
								<p className="m-0 text-sm leading-relaxed break-keep text-ink">
									{emphasize(info.description)}
								</p>
							</GamePanel>
						</m.div>
					)}

					<m.div variants={rise}>
						<AxisBars axisScores={axisScores} />
					</m.div>

					{info !== null && info.match.length > 0 && (
						<m.div variants={rise}>
							<GamePanel as="section" aria-label="환상의 궁합" className="px-4 pt-4 pb-5">
								<h2 className="m-0 mb-4 font-display text-lg font-normal text-ink">
									🤝 <Marker variant="head">환상의 궁합</Marker>
								</h2>
								<div className="flex gap-3">
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
							🗂 도감 보기
						</GameButton>
						<GameButton
							variant="secondary"
							className="flex-1"
							onClick={withTrack('restart_click', { source: 'owner' }, handleRestart)}
						>
							↺ 다시하기
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
