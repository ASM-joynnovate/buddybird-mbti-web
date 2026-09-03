'use client';

import { useEffect, useRef, useState } from 'react';

import localFont from 'next/font/local';
import { useRouter } from 'next/navigation';

import type { Choice } from '@/types/mbti';

import { track, trackEvent } from '@/lib/analytics/track';
import { QUESTIONS, QUESTION_COUNT } from '@/lib/content/questions';
import { computeResult } from '@/lib/mbti/compute-result';
import { speciesOffsetChoice } from '@/lib/mbti/species-weight';
import { easeLeaf, easeSpring, fadeOnly, popIn } from '@/lib/motion/variants';
import { RESULT_PARAM, encodeResult } from '@/lib/result-url';

import { QuizChoice } from '@/app/(forest)/test/_components/ui/quiz-choice';
import { useTestProgress } from '@/providers/test-progress-provider';
import { AnimatePresence, type Variants, m, useReducedMotion } from 'motion/react';

import { QuestSheet } from '@/components/quest-sheet';
import { GamePill } from '@/components/ui/badge';
import { GameButton } from '@/components/ui/button';

const nexon = localFont({
	src: [
		{ path: '../../../../../public/fonts/nexon/NEXONLv2Gothic-Regular.woff2', weight: '400' },
		{ path: '../../../../../public/fonts/nexon/NEXONLv2Gothic-Bold.woff2', weight: '700' },
	],
	display: 'swap',
	preload: false,
	variable: '--font-nexon',
});

type Direction = 'r' | 'l';

const cardVariants: Variants = {
	enter: (direction: Direction) => ({ opacity: 0, x: direction === 'r' ? 18 : -18 }),
	center: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.36, ease: easeSpring },
	},
	exit: (direction: Direction) => ({
		opacity: 0,
		x: direction === 'r' ? -14 : 14,
		pointerEvents: 'none',
		transition: { duration: 0.16, ease: easeLeaf },
	}),
};

const cardVariantsReduced: Variants = {
	enter: { opacity: 0 },
	center: { opacity: 1, transition: { duration: 0.12 } },
	exit: { opacity: 0, pointerEvents: 'none', transition: { duration: 0.08 } },
};

export function TestView() {
	const router = useRouter();
	const { answers, currentIndex, answer, setIndex, goBack, setResult, species } = useTestProgress();
	const reducedMotion = useReducedMotion();

	const [picked, setPicked] = useState<string | null>(null);
	const [direction, setDirection] = useState<Direction>('r');
	const [fontReady, setFontReady] = useState(false);
	const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		let fontTimer: ReturnType<typeof setTimeout> | undefined;
		const scheduleFont = () => {
			fontTimer = setTimeout(() => {
				Promise.all([
					document.fonts.load(`400 1em ${nexon.style.fontFamily}`),
					document.fonts.load(`700 1em ${nexon.style.fontFamily}`),
				]).then(() => setFontReady(true));
			}, 3000);
		};
		if (document.readyState === 'complete') {
			scheduleFont();
		} else {
			window.addEventListener('load', scheduleFont, { once: true });
		}
		return () => {
			window.removeEventListener('load', scheduleFont);
			if (fontTimer !== undefined) clearTimeout(fontTimer);
			if (advanceTimer.current !== null) {
				clearTimeout(advanceTimer.current);
			}
		};
	}, []);

	const question = QUESTIONS[currentIndex];

	if (question === undefined) {
		return (
			<main className="flex min-h-dvh flex-col items-center justify-center px-gutter">
				<p className="text-ink-muted">표시할 문항이 없습니다.</p>
			</main>
		);
	}

	const isLast = currentIndex === QUESTION_COUNT - 1;

	const handleChoice = (choice: Choice) => {
		if (picked !== null) {
			return;
		}
		setPicked(choice.id);
		answer(question.id, choice);
		track({
			name: 'question_answered',
			payload: {
				questionId: question.id,
				choiceId: choice.id,
				index: currentIndex,
			},
		});

		const delay = reducedMotion ? 120 : 420;

		advanceTimer.current = setTimeout(() => {
			if (!isLast) {
				setDirection('r');
				setPicked(null);
				setIndex(currentIndex + 1);
				return;
			}

			const finalAnswers: Record<string, Choice> = { ...answers, [question.id]: choice };
			const orderedChoices = QUESTIONS.map((q) => finalAnswers[q.id]);

			try {
				const speciesChoice = species ? speciesOffsetChoice(species) : null;
				const allChoices = speciesChoice ? [...orderedChoices, speciesChoice] : orderedChoices;
				const result = computeResult(allChoices);
				setResult(result);
				track({ name: 'test_completed', payload: { type: result.type } });
				router.push(`/result/?${RESULT_PARAM}=${encodeResult(result.type, result.axisScores)}`);
			} catch {
				setPicked(null);
				setIndex(0);
				router.push('/');
			}
		}, delay);
	};

	const handleBack = () => {
		trackEvent('test_back', { index: currentIndex });
		if (advanceTimer.current !== null) {
			clearTimeout(advanceTimer.current);
		}
		setPicked(null);
		if (currentIndex === 0) {
			router.push('/species');
			return;
		}
		setDirection('l');
		goBack();
	};

	const filled = currentIndex + (picked !== null ? 1 : 0);
	const pct = Math.round((filled / QUESTION_COUNT) * 100);

	return (
		<main className={`relative flex min-h-dvh flex-col px-gutter pt-15 pb-10 ${fontReady ? nexon.variable : ''}`}>
			<div className="flex items-center gap-3">
				<GameButton
					variant="icon"
					onClick={handleBack}
					aria-label={currentIndex === 0 ? '나가기' : '이전 문항'}
				>
					←
				</GameButton>

				<div
					className="h-4 flex-1 overflow-hidden rounded-full border-2 border-border-action bg-surface-cream
						shadow-inset-track"
					role="progressbar"
					aria-label="테스트 진행률"
					aria-valuemin={1}
					aria-valuemax={QUESTION_COUNT}
					aria-valuenow={currentIndex + 1}
					aria-valuetext={`${QUESTION_COUNT}문항 중 ${currentIndex + 1}번째`}
				>
					<m.div
						className="h-full rounded-full
							bg-[linear-gradient(90deg,var(--color-gold),var(--color-primary))] shadow-inset-highlight"
						initial={false}
						animate={{ width: `${pct}%` }}
						transition={reducedMotion ? { duration: 0.08 } : { duration: 0.5, ease: easeSpring }}
					/>
				</div>

				<GamePill bare className="px-3 py-1 font-display text-base text-ink">
					<b className="font-normal text-primary">{currentIndex + 1}</b>
					&nbsp;/ {QUESTION_COUNT}
				</GamePill>
			</div>

			<AnimatePresence mode="wait" custom={direction}>
				<m.div
					className="flex min-h-0 flex-1 flex-col"
					key={currentIndex}
					custom={direction}
					variants={reducedMotion ? cardVariantsReduced : cardVariants}
					initial="enter"
					animate="center"
					exit="exit"
				>
					<QuestSheet className="mt-8" panelClassName="py-7">
						<div className="flex items-center justify-between gap-3">
							<p className="m-0 font-display text-3xl leading-none text-primary">No.{currentIndex + 1}</p>
							<m.span
								aria-hidden="true"
								className="grid size-14 rotate-6 place-items-center rounded-sm border-2 border-dashed
									border-primary bg-primary-soft text-3xl shadow-[0_2px_0_var(--color-depth-action)]"
								variants={reducedMotion ? fadeOnly : popIn}
								initial="hidden"
								animate="visible"
							>
								{question.emoji}
							</m.span>
						</div>
						<h1
							className="m-0 mt-4 font-display text-2xl leading-snug break-keep whitespace-pre-line
								text-ink"
						>
							{question.text}
						</h1>
					</QuestSheet>

					<div className="mt-auto flex flex-col gap-3.5 pt-5">
						{question.choices.map((choice, i) => (
							<QuizChoice
								key={choice.id}
								choice={choice}
								index={i}
								picked={picked}
								reducedMotion={reducedMotion === true}
								onPick={handleChoice}
							/>
						))}
					</div>
				</m.div>
			</AnimatePresence>
		</main>
	);
}
