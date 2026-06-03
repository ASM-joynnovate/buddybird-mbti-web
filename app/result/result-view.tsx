'use client'

import type { CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppCtaButton } from '@/components/app-cta-button'
import { ParrotImage } from '@/components/parrot-image'
import { PhotoInput } from '@/components/photo-input'
import { ShareButton } from '@/components/share-button'
import { getTypeInfo } from '@/content'
import { GROUP_CSS_VAR, temperamentGroup, type TemperamentGroup } from '@/lib/mbti'
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

export function ResultView() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { result, reset } = useTestProgress()
    const photo = usePhotoSource()

    // Own result = the visitor finished the test this session (in-memory result).
    // Shared visitor = arrived via a shared URL with only the ?t= param. The Test
    // page appends ?t= even for the player's own result, so the param alone cannot
    // distinguish the two — in-memory presence is the real signal.
    const ownType = result?.type ?? null
    const sharedType = decodeResult(searchParams.get(RESULT_PARAM))
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
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="result-restart"
                    >
                        처음으로
                    </button>
                </div>
            </main>
        )
    }

    const info = getTypeInfo(type)
    const group = temperamentGroup(type)

    return (
        <main data-testid="result-root" className="result-surface">
            <div className="result-foliage" aria-hidden="true">
                <span className="result-leaf result-leaf--tr" />
                <span className="result-leaf result-leaf--bl" />
            </div>

            <div className="result-content">
                <span
                    className="result-badge"
                    style={{ '--result-group': GROUP_CSS_VAR[group] } as CSSProperties}
                >
                    {GROUP_LABEL[group]}
                </span>

                <div className="result-hero">
                    <ParrotImage type={type} width={640} height={640} loading="eager" />
                </div>

                <p data-testid="result-type" className="result-type font-display">
                    {type}
                </p>

                {info !== null && (
                    <>
                        <h1 className="result-name font-display">{info.name}</h1>
                        <p className="result-report">{info.report}</p>
                    </>
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
                    {isSharedVisitor ? (
                        <button
                            type="button"
                            data-testid="retake-button"
                            onClick={handleRestart}
                            className="result-restart"
                        >
                            나도 테스트하기
                        </button>
                    ) : (
                        <button
                            type="button"
                            data-testid="restart-button"
                            onClick={handleRestart}
                            className="result-restart"
                        >
                            다시하기
                        </button>
                    )}
                </div>
            </div>
        </main>
    )
}
