'use client';

import { type ReactNode, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import type { TypeCode } from '@/types/mbti';

import { useDeckController } from '@/hooks/use-deck-controller';

import { track, trackEvent } from '@/lib/analytics/track';
import { withTrack } from '@/lib/analytics/with-track';
import { CAROUSEL_TYPES } from '@/lib/content/assets';
import { isResultCopyReferral } from '@/lib/content/invite-link';
import { currentLocalePath } from '@/lib/i18n/path';

import { BackStack, type BackStackControls } from '@/app/[locale]/(forest)/_components/back-stack';
import { useTranslation } from '@/providers/locale-provider';
import { useTestProgress } from '@/providers/test-progress-provider';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

import { DeckOverlay } from '@/components/deck-overlay/deck-overlay-lazy';
import { DetailDialog } from '@/components/detail-dialog-lazy';
import { GameButton } from '@/components/ui/button';

const ENTRANCE_CLASS = 'animate-enter-up motion-reduce:animate-enter-fade';

const STACK_LEAD: readonly TypeCode[] = ['ENFP', 'INTJ', 'ESFP', 'ISFP', 'ENTP', 'INFJ', 'ENTJ', 'ISFJ'];
const STACK_POOL: readonly TypeCode[] = [...STACK_LEAD, ...CAROUSEL_TYPES.filter((code) => !STACK_LEAD.includes(code))];

interface IntroViewProps {
	heading: ReactNode;
	stats: ReactNode;
}

export function IntroView({ heading, stats }: IntroViewProps) {
	const t = useTranslation();
	const router = useRouter();
	const { reset, setIndex } = useTestProgress();
	const reducedMotion = useReducedMotion();

	const deck = useDeckController('intro');
	const stackControls = useRef<BackStackControls | null>(null);
	const [detail, setDetail] = useState<TypeCode | null>(null);
	const inviteTestStartTracked = useRef(false);

	const handleStart = () => {
		reset();
		setIndex(0);
		track({ name: 'test_start', payload: {} });
		if (!inviteTestStartTracked.current && isResultCopyReferral(window.location.search)) {
			inviteTestStartTracked.current = true;
			track({ name: 'result_copy_test_start', payload: {} });
		}
		router.push(currentLocalePath('/species'));
	};

	const handlePickHome = () => {
		if (detail !== null) {
			trackEvent('detail_cta_click', { type: detail });
			stackControls.current?.setActive(detail);
		}
		setDetail(null);
		deck.close();
	};

	return (
		<main
			className="relative flex min-h-dvh flex-col items-center overflow-x-clip px-gutter
				pt-[clamp(5.25rem,12dvh,7rem)] pb-[clamp(2.5rem,9dvh,5.5rem)] text-center"
		>
			{/* 등장 애니메이션은 CSS로 재생해 JS 로드 전에도 내용이 보이게 한다. */}
			<div className="flex min-h-0 w-full flex-1 flex-col items-center">
				<div className={`flex w-full flex-col items-center gap-4 ${ENTRANCE_CLASS} [animation-delay:40ms]`}>
					{heading}

					<BackStack
						pool={STACK_POOL}
						intervalMs={3000}
						controller={deck}
						onCardTap={withTrack(
							'detail_open',
							(code: TypeCode) => ({ type: code, source: 'stack' }),
							setDetail,
						)}
						paused={detail !== null}
						controlsRef={stackControls}
					/>
				</div>

				<div
					className={`mt-auto flex w-full flex-col items-center gap-4 pt-4 ${ENTRANCE_CLASS}
						[animation-delay:120ms]`}
				>
					<GameButton variant="secondary" onClick={deck.openAnimated}>
						{t('🗂 16유형 모두 보기')}
					</GameButton>

					{stats}

					<div className="relative isolate flex w-full justify-center">
						{!reducedMotion && (
							<m.span
								className="pointer-events-none absolute inset-x-0 -inset-y-1.5 -z-10 mx-auto w-full
									max-w-88 rounded-full
									bg-[radial-gradient(closest-side,rgba(232,119,46,0.35),transparent)]"
								animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.98, 1.04, 0.98] }}
								transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
								aria-hidden="true"
							/>
						)}
						<GameButton onClick={handleStart} className="w-full max-w-85">
							{t('테스트 시작하기')} <span aria-hidden="true">→</span>
						</GameButton>
					</div>
				</div>
			</div>

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
						cta={{ label: t('이 친구 홈에서 보기'), onClick: handlePickHome }}
					/>
				)}
			</AnimatePresence>
		</main>
	);
}
