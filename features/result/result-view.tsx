'use client'

// Result reveal — 동화숲 월드 v2: opaque kraft-paper backdrop (occludes the
// forest), full-bleed --type-grad hero (bobbing art, CODE + 이름 on one row,
// faction badge), then the raised-block panels: 설명 / 성향 스펙트럼 / 환상의
// 궁합 (MatchCard → DetailPopup in place) / 사진. Actions: 친구에게 공유하기
// (primary, the existing canvas share logic) + 도감 보기 (opens the deck
// overlay right here) + 다시하기 + the app CTA. The ?t= deep-link / share /
// photo logic is untouched.
//
// Motion: hero and body sections enter once via the shared variants
// (popIn/fadeUp + stagger) — important information animates a single time.
// Under prefers-reduced-motion every entrance degrades to the opacity-only
// fadeOnly variant; the page is fully readable without motion.
import { useState, type CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, m, useReducedMotion, type Variants } from 'motion/react'
import { getTypeInfo, typeGradient } from '@/content'
import { AppCtaButton } from '@/features/app-install/app-cta-button'
import { DeckOverlay, useDeckController } from '@/features/deck/deck-overlay'
import { DetailPopup } from '@/features/deck/detail-popup'
import { useTestProgress } from '@/features/quiz/test-progress-context'
import { AxisBars } from '@/features/result/axis-bars'
import { Confetti } from '@/features/result/confetti'
import { MatchCard } from '@/features/result/match-card'
import { PhotoInput } from '@/features/share/photo-input'
import { ShareButton } from '@/features/share/share-button'
import { usePhotoSource } from '@/features/share/use-photo-source'
import {
    AXES,
    AXIS_LETTERS,
    temperamentGroup,
    type Axis,
    type AxisScore,
    type TemperamentGroup,
    type TypeCode,
} from '@/lib/mbti'
import { GROUP_CSS_VAR } from '@/lib/mbti/temperament'
import { decodeResult, RESULT_PARAM } from '@/lib/result-url'
import { easeSpring, fadeOnly, fadeUp, popIn, staggerContainer } from '@/shared/motion'
import { GameButton } from '@/shared/ui/game-button'
import { GamePanel } from '@/shared/ui/game-panel'
import { ParrotImage } from '@/shared/ui/parrot-image'

// Hero-art entrance: rise-from-below + scale envelope, Motion-owned.
const heroArtRise: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.55, ease: easeSpring },
    },
}

// Korean labels for the four temperament groups (CONTEXT.md domain concept).
const GROUP_LABEL: Record<TemperamentGroup, string> = {
    Analysts: '분석가형',
    Diplomats: '외교관형',
    Sentinels: '관리자형',
    Explorers: '탐험가형',
}

// Opaque kraft-paper page base — fully occludes the forest backdrop (binding
// decision: the result reads as a calm report page, not a forest scene).
const PAPER_CLASS =
    'relative min-h-dvh bg-[radial-gradient(130%_80%_at_50%_0%,#fff6e0_0%,#f4e7cb_70%,#efdfbf_100%)]'

// Fallback axis tallies for a shared visitor arriving on a legacy/manual bare code
// (no encoded tally). The exact per-axis counts aren't recoverable from the type code
// alone, so lean each axis fully toward its winning letter — the bars still read as
// intentional. Tokens from the current encoder carry exact tallies and skip this.
function fallbackScores(type: TypeCode): Record<Axis, AxisScore> {
    return AXES.reduce(
        (acc, axis, index) => {
            const leftWins = type[index] === AXIS_LETTERS[axis].left
            acc[axis] = leftWins ? { left: 1, right: 0 } : { left: 0, right: 1 }
            return acc
        },
        {} as Record<Axis, AxisScore>,
    )
}

export function ResultView() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { result, reset } = useTestProgress()
    const photo = usePhotoSource()
    const reducedMotion = useReducedMotion()

    const deck = useDeckController()
    const [detail, setDetail] = useState<TypeCode | null>(null)

    // One-shot reveal vocabulary; every entrance degrades to an opacity-only
    // fade under reduced motion (ADR-0006 convention).
    const rise = reducedMotion ? fadeOnly : fadeUp
    const pop = reducedMotion ? fadeOnly : popIn
    const art = reducedMotion ? fadeOnly : heroArtRise

    // Own result = the visitor finished the test this session (in-memory result).
    // Shared visitor = arrived via a shared URL with only the ?t= token. The Test
    // page appends ?t= even for the player's own result, so the param alone cannot
    // distinguish the two — in-memory presence is the real signal.
    const ownType = result?.type ?? null
    const decoded = decodeResult(searchParams.get(RESULT_PARAM))
    const sharedType = decoded?.type ?? null
    const type = ownType ?? sharedType
    const isSharedVisitor = ownType === null && sharedType !== null

    const handleRestart = () => {
        reset()
        router.push('/')
    }

    if (type === null) {
        return (
            <main data-testid="result-root" className={PAPER_CLASS}>
                <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-gutter">
                    <p className="m-0 text-ink-muted">결과 없음</p>
                    <GameButton variant="secondary" onClick={() => router.push('/')}>
                        처음으로
                    </GameButton>
                </div>
            </main>
        )
    }

    const info = getTypeInfo(type)
    const group = temperamentGroup(type)

    // Axis bars: real tallies for the player, the exact URL-encoded tallies for a
    // shared visitor, or a full-lean fallback for a legacy bare code.
    const axisScores =
        result !== null && ownType !== null
            ? result.axisScores
            : (decoded?.axisScores ?? fallbackScores(type))

    // Per-type identity gradient is the primary hero visual; the temperament
    // group is demoted to the faction badge.
    const heroStyle = { '--type-grad': typeGradient(type) } as CSSProperties

    return (
        <main data-testid="result-root" className={PAPER_CLASS}>
            <Confetti />

            {/* One-shot staggered reveal: hero pieces first, then the body blocks.
                Variant labels cascade from this container; children only declare
                their own `variants`. */}
            <m.div variants={staggerContainer} initial="hidden" animate="visible">
                <m.header
                    className="relative flex flex-col items-center overflow-hidden rounded-b-4xl px-gutter pt-15 pb-6 text-center shadow-[0_16px_32px_-14px_rgba(20,12,6,0.6),inset_0_-2px_0_rgba(0,0,0,0.12)] [background:var(--type-grad)]"
                    style={heroStyle}
                    variants={staggerContainer}
                >
                    {/* Gradient washes — sheen above, grounding shade below. */}
                    <span
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(255,255,255,0.4),transparent_55%),radial-gradient(140%_90%_at_50%_130%,rgba(0,0,0,0.32),transparent_60%)]"
                        aria-hidden="true"
                    />

                    <m.p
                        className="relative z-1 m-0 font-display text-lg text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.4)]"
                        variants={rise}
                    >
                        🎉 나의 앵무새 성격은
                    </m.p>

                    <m.div className="relative z-1 my-1.5 size-38" variants={art}>
                        {reducedMotion ? (
                            <ParrotImage
                                type={type}
                                width={304}
                                height={304}
                                loading="eager"
                                className="h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
                            />
                        ) : (
                            <m.div
                                className="h-full w-full"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <ParrotImage
                                    type={type}
                                    width={304}
                                    height={304}
                                    loading="eager"
                                    className="h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
                                />
                            </m.div>
                        )}
                    </m.div>

                    <div className="relative z-1 mb-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
                        <m.p
                            data-testid="result-type"
                            className="m-0 font-display text-4xl leading-none tracking-wider text-white [text-shadow:0_3px_10px_rgba(0,0,0,0.4)]"
                            variants={pop}
                        >
                            {type}
                        </m.p>
                        {info !== null && (
                            <m.h1
                                className="m-0 font-display text-lg leading-[1.1] font-normal break-keep text-gold [text-shadow:0_2px_6px_rgba(0,0,0,0.45)]"
                                variants={rise}
                            >
                                {info.name}
                            </m.h1>
                        )}
                    </div>

                    <m.span
                        className="relative z-1 rounded-full border-[1.5px] border-white/70 px-4 py-1.5 font-display text-sm whitespace-nowrap text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_10px_-4px_rgba(0,0,0,0.4)]"
                        style={{ background: GROUP_CSS_VAR[group] }}
                        variants={rise}
                    >
                        {GROUP_LABEL[group]}
                    </m.span>
                </m.header>

                <m.div
                    className="flex flex-col gap-4 px-gutter pt-5 pb-9"
                    variants={staggerContainer}
                >
                    {info !== null && (
                        <m.div variants={rise}>
                            <GamePanel as="section" aria-label="성격 설명" className="px-4 py-5">
                                <p className="m-0 text-sm leading-relaxed break-keep text-ink">
                                    {info.description}
                                </p>
                            </GamePanel>
                        </m.div>
                    )}

                    <m.div variants={rise}>
                        <AxisBars axisScores={axisScores} />
                    </m.div>

                    {/* Compatibility ("궁합") — best-match cards open the detail popup. */}
                    {info !== null && info.match.length > 0 && (
                        <m.div variants={rise}>
                            <GamePanel
                                as="section"
                                aria-label="환상의 궁합"
                                className="px-4 pt-4 pb-5"
                            >
                                <h2 className="m-0 mb-4 font-display text-lg font-normal text-ink">
                                    🤝 환상의 궁합
                                </h2>
                                <div className="flex gap-3">
                                    {info.match.map((matchCode) => (
                                        <MatchCard
                                            key={matchCode}
                                            code={matchCode}
                                            onSelect={setDetail}
                                        />
                                    ))}
                                </div>
                            </GamePanel>
                        </m.div>
                    )}

                    {/* Photo (#08) — own results only; feeds the share card (#09). */}
                    {!isSharedVisitor && (
                        <m.div variants={rise}>
                            <GamePanel className="px-4 py-4">
                                <PhotoInput
                                    objectUrl={photo.objectUrl}
                                    onPick={photo.setFile}
                                    onClear={photo.clear}
                                />
                            </GamePanel>
                        </m.div>
                    )}

                    <m.div className="mt-1 flex flex-col gap-3" variants={rise}>
                        {!isSharedVisitor && <ShareButton type={type} photoUrl={photo.objectUrl} />}
                        {isSharedVisitor && (
                            <GameButton
                                size="sm"
                                className="w-full"
                                data-testid="retake-button"
                                onClick={handleRestart}
                            >
                                나도 테스트하기
                            </GameButton>
                        )}
                        <div className="flex gap-3">
                            <GameButton
                                variant="secondary"
                                className="flex-1"
                                data-testid="deck-open-button"
                                onClick={deck.openAnimated}
                            >
                                🗂 도감 보기
                            </GameButton>
                            {!isSharedVisitor && (
                                <GameButton
                                    variant="secondary"
                                    className="flex-1"
                                    data-testid="restart-button"
                                    onClick={handleRestart}
                                >
                                    ↺ 다시하기
                                </GameButton>
                            )}
                        </div>
                        <div className="flex justify-center">
                            <AppCtaButton placement="result" />
                        </div>
                    </m.div>
                </m.div>
            </m.div>

            {/* Deck overlay + detail popup, mounted locally (no /dex route). */}
            <DeckOverlay controller={deck} onSelect={setDetail} />
            <AnimatePresence>
                {detail !== null && (
                    <DetailPopup
                        code={detail}
                        onClose={() => setDetail(null)}
                        onSelectType={setDetail}
                    />
                )}
            </AnimatePresence>
        </main>
    )
}
