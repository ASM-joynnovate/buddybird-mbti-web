'use client'

import type { CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppCtaButton } from '@/components/app-cta-button'
import { AxisBars } from '@/components/axis-bars'
import { Confetti } from '@/components/confetti'
import { GameButton } from '@/components/game-button'
import { MatchChip } from '@/components/match-chip'
import { ParrotImage } from '@/components/parrot-image'
import { PhotoInput } from '@/components/photo-input'
import { ShareButton } from '@/components/share-button'
import { getTypeInfo, typeGradient } from '@/content'
import {
    AXES,
    AXIS_LETTERS,
    temperamentGroup,
    type Axis,
    type AxisScore,
    type TemperamentGroup,
    type TypeCode,
} from '@/lib/mbti'
import { usePhotoSource } from '@/lib/photo/use-photo-source'
import { decodeResult, RESULT_PARAM } from '@/lib/result-url'
import { useTestProgress } from '@/lib/state/test-progress-context'
import './result.css'

// Korean labels for the four temperament groups (CONTEXT.md domain concept).
const GROUP_LABEL: Record<TemperamentGroup, string> = {
    Analysts: '분석가형',
    Diplomats: '외교관형',
    Sentinels: '관리자형',
    Explorers: '탐험가형',
}

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
            <main data-testid="result-root" className="result-surface">
                <div className="result-empty">
                    <p style={{ color: 'var(--color-ink-muted)' }}>결과 없음</p>
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

    // Per-type identity gradient is the primary hero visual ("동화숲 월드", ADR-0002);
    // the temperament group is demoted to the badge label only.
    const heroStyle = {
        '--result-gradient': typeGradient(type),
    } as CSSProperties

    return (
        <main data-testid="result-root" className="result-surface">
            <Confetti />

            <div className="result-foliage" aria-hidden="true">
                <span className="result-leaf result-leaf--tr" />
                <span className="result-leaf result-leaf--bl" />
            </div>

            <div className="result-content">
                <header className="result-hero" style={heroStyle}>
                    <span className="result-badge">{GROUP_LABEL[group]}</span>

                    <div className="result-hero-art anim-float-up">
                        <ParrotImage type={type} width={640} height={640} loading="eager" />
                    </div>

                    <p data-testid="result-type" className="result-type font-display">
                        {type}
                    </p>

                    {info !== null && (
                        <>
                            <h1 className="result-name font-display">{info.name}</h1>
                            <p className="result-tag">{info.report}</p>
                        </>
                    )}
                </header>

                <div className="result-body">
                    {info !== null && <p className="result-description">{info.description}</p>}

                    <AxisBars axisScores={axisScores} />

                    {/* Compatibility ("궁합") — best-match types, deep-linking to the dex. */}
                    {info !== null && info.match.length > 0 && (
                        <section className="result-match" aria-label="환상의 궁합">
                            <h2 className="result-match-title">환상의 궁합</h2>
                            <div className="chips result-match-chips">
                                {info.match.map((matchCode) => (
                                    <MatchChip key={matchCode} code={matchCode} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Photo input (#08) + share card (#09) — own results only. */}
                    {!isSharedVisitor && (
                        <div className="result-share-slot">
                            <PhotoInput
                                objectUrl={photo.objectUrl}
                                onPick={photo.setFile}
                                onClear={photo.clear}
                            />
                            <ShareButton type={type} photoUrl={photo.objectUrl} />
                        </div>
                    )}

                    <div className="result-actions">
                        <AppCtaButton placement="result" />
                        <GameButton
                            variant="secondary"
                            data-testid="dex-link"
                            onClick={() => router.push(`/dex?mine=${type}`)}
                        >
                            도감에서 보기
                        </GameButton>
                        {isSharedVisitor ? (
                            <GameButton
                                variant="secondary"
                                data-testid="retake-button"
                                onClick={handleRestart}
                            >
                                나도 테스트하기
                            </GameButton>
                        ) : (
                            <GameButton
                                variant="secondary"
                                data-testid="restart-button"
                                onClick={handleRestart}
                            >
                                다시하기
                            </GameButton>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
