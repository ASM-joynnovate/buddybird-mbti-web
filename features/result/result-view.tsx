'use client'

// Result reveal — 동화숲 월드 v2 (polaroid redesign, ADR-0012). ONE unified
// layout (ADR-0013 removed the separate shared-visitor variant): the result comes
// from the in-memory result (just took the test) OR is restored by decoding the
// ?t= param, so a refresh — and anyone opening the result URL — sees the same
// page. ?t= stays as the durable record of which result came out. Only a load
// with no result at all (no in-memory AND no/invalid ?t=) redirects to the intro.
//
// Layout: opaque kraft-paper backdrop, eyebrow + adaptive polaroid hero (캐릭터
// 한 장, or 내 앵무새 → 캐릭터 두 장 once a photo is attached) + faction badge;
// then 사진 + 친구에게 공유하기 + 버디버드 앱 CTA (pulled above the report), the
// raised-block panels 성격 분석 (report lead + desc, 형광펜 marker) / 성향
// 스펙트럼 / 환상의 궁합 (MatchCard → DetailPopup), and 도감 보기 + 다시하기.
//
// Motion: hero and body sections enter once via the shared variants (popIn/
// fadeUp + stagger). Under prefers-reduced-motion every entrance degrades to the
// opacity-only fadeOnly variant; the page is fully readable without motion.
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, m, useReducedMotion, type Variants } from 'motion/react'
import { getTypeInfo, typeGradient } from '@/content'
import { AppCtaButton } from '@/features/app-install/app-cta-button'
import { DeckOverlay, useDeckController } from '@/features/deck/deck-overlay'
import { useTestProgress } from '@/features/quiz/test-progress-context'
import { AxisBars } from '@/features/result/axis-bars'
import { Confetti } from '@/features/result/confetti'
import { emphasize, Marker } from '@/features/result/emphasize'
import { MatchCard } from '@/features/result/match-card'
import { ResultPolaroid } from '@/features/result/result-polaroid'
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
import { trackEvent, withTrack } from '@/shared/analytics'
import { easeSpring, fadeOnly, fadeUp, staggerContainer } from '@/shared/motion'
import { GameButton } from '@/shared/ui/game-button'
import { GamePanel } from '@/shared/ui/game-panel'

// Detail popup is tap-only UI — code-split out of the initial bundle and
// fetched on the first match-card tap (it only renders when `detail` is set).
const DetailPopup = dynamic(
    () => import('@/features/deck/detail-popup').then((mod) => mod.DetailPopup),
    { ssr: false },
)

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

// Fallback axis tallies for a legacy/manual bare code (?t=ENFP with no encoded
// tally). The exact per-axis counts aren't recoverable from the type code alone,
// so lean each axis fully toward its winning letter — the bars still read as
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

    const deck = useDeckController('result')
    const [detail, setDetail] = useState<TypeCode | null>(null)

    // One-shot reveal vocabulary; every entrance degrades to an opacity-only
    // fade under reduced motion (ADR-0006 convention).
    const rise = reducedMotion ? fadeOnly : fadeUp
    const art = reducedMotion ? fadeOnly : heroArtRise

    const handleRestart = () => {
        reset()
        router.push('/')
    }

    // Result source: the in-memory result (just took the test) OR the ?t= param
    // decoded back into a type + tallies (refresh or a shared link). Primitive
    // reads keep the entry effect's deps honest. `visitor` is analytics-only —
    // the layout is identical for both.
    const ownType = result?.type ?? null
    const resultParam = searchParams.get(RESULT_PARAM)
    const decoded = decodeResult(resultParam)
    const type = ownType ?? decoded?.type ?? null

    // Entry: result_view (owner vs link visitor), OR — when nothing resolves (no
    // in-memory result AND no/invalid ?t=) — record result_error and redirect to
    // the intro. The ref guard limits it to the FIRST run (StrictMode dev double
    // effect); router.replace avoids leaving a dead /result in history.
    const entryHandled = useRef(false)
    useEffect(() => {
        if (entryHandled.current) return
        entryHandled.current = true
        if (type !== null) {
            trackEvent('result_view', { type, visitor: ownType !== null ? 'owner' : 'shared' })
        } else {
            trackEvent('result_error', { reason: resultParam === null ? 'missing' : 'invalid' })
            router.replace('/')
        }
    }, [type, ownType, resultParam, router])

    // No result at all — redirecting; render only the paper base (no content flash).
    if (type === null) {
        return <main data-testid="result-root" className={PAPER_CLASS} />
    }

    const info = getTypeInfo(type)
    const group = temperamentGroup(type)
    // Real tallies for the player, the exact URL-encoded tallies for a link
    // visitor, or a full-lean fallback for a legacy bare code.
    const axisScores = result?.axisScores ?? decoded?.axisScores ?? fallbackScores(type)

    // Per-type identity gradient now lives inside the polaroid photo window
    // (the hero itself sits on plain kraft paper). The temperament group is the
    // faction badge.
    const gradient = typeGradient(type)

    return (
        <main data-testid="result-root" className={PAPER_CLASS}>
            <Confetti />

            {/* One-shot staggered reveal: hero pieces first, then the body blocks.
                Variant labels cascade from this container; children only declare
                their own `variants`. */}
            <m.div variants={staggerContainer} initial="hidden" animate="visible">
                <m.header
                    className="relative flex flex-col items-center px-gutter pt-14 pb-2 text-center"
                    variants={staggerContainer}
                >
                    <m.p
                        className="relative z-1 m-0 font-display text-lg text-primary-active"
                        variants={rise}
                    >
                        🎉 나의 앵무새 성격은
                    </m.p>

                    {/* Adaptive polaroid: character only, or pet → character when a
                        photo is attached. Code + name live in its caption. The
                        per-type gradient fills the photo window. */}
                    <m.div className="relative z-1 my-4 w-full" variants={art}>
                        <ResultPolaroid
                            type={type}
                            name={info?.name ?? type}
                            gradient={gradient}
                            photoUrl={photo.objectUrl}
                            reducedMotion={reducedMotion === true}
                        />
                    </m.div>

                    <m.span
                        className="relative z-1 rounded-full border-[length:var(--border-hair)] border-white/70 px-4 py-1.5 font-display text-sm whitespace-nowrap text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_10px_-4px_rgba(0,0,0,0.4)]"
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
                    {/* 사진 + 공유 + 앱 CTA (#08/#09) — pulled above 성격 분석. The
                        attached photo feeds both the hero polaroid (two photos) and
                        the share card. */}
                    <m.div className="flex flex-col gap-3" variants={rise}>
                        <GamePanel className="px-4 py-4">
                            <PhotoInput
                                objectUrl={photo.objectUrl}
                                onPick={photo.setFile}
                                onClear={photo.clear}
                            />
                        </GamePanel>
                        <ShareButton type={type} photoUrl={photo.objectUrl} />
                        <AppCtaButton placement="result" />
                    </m.div>

                    {info !== null && (
                        <m.div variants={rise}>
                            <GamePanel
                                as="section"
                                aria-label="성격 분석"
                                className="px-4 pt-4 pb-5"
                            >
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

                    {/* Compatibility ("궁합") — best-match cards open the detail popup. */}
                    {info !== null && info.match.length > 0 && (
                        <m.div variants={rise}>
                            <GamePanel
                                as="section"
                                aria-label="환상의 궁합"
                                className="px-4 pt-4 pb-5"
                            >
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
                        <GameButton
                            variant="secondary"
                            className="flex-1"
                            data-testid="deck-open-button"
                            onClick={deck.openAnimated}
                        >
                            🗂 도감 보기
                        </GameButton>
                        <GameButton
                            variant="secondary"
                            className="flex-1"
                            data-testid="restart-button"
                            onClick={withTrack('restart_click', { source: 'owner' }, handleRestart)}
                        >
                            ↺ 다시하기
                        </GameButton>
                    </m.div>
                </m.div>
            </m.div>

            {/* Deck overlay + detail popup, mounted locally (no /dex route). */}
            <DeckOverlay
                controller={deck}
                onSelect={withTrack(
                    'detail_open',
                    (code: TypeCode) => ({ type: code, source: 'deck' }),
                    setDetail,
                )}
            />
            <AnimatePresence>
                {detail !== null && (
                    <DetailPopup
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
    )
}
