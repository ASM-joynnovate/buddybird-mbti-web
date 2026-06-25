'use client'

// Species selection — search-first tag cloud (prototype variant D) under the
// pinned quest-card header (prototype variant A). The header is a tilted
// GamePanel with a pushpin decoration; below it a type-to-filter field narrows
// the species, which flow as wrapping raised pill chips instead of a rigid
// grid. '기타' is pinned to the end and reveals an inline name field; an empty
// search shows a dashed "no results" card on a solid surface (legible off the
// forest backdrop). The bottom pairs a guidance chip (red-X "골라 주세요" →
// orange "선택됨") with the confirm CTA, whose disabled state is the GameButton
// solid locked look (🔒). Rendered by the server-component shell in page.tsx,
// which owns the route metadata.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { m, useReducedMotion } from 'motion/react'
import { useTestProgress } from '@/features/quiz/test-progress-context'
import { SPECIES_LIST, type Species } from '@/lib/mbti/species-weight'
import { track } from '@/shared/analytics'
import { cardTap } from '@/shared/motion'
import { GameButton } from '@/shared/ui/game-button'
import { GamePanel } from '@/shared/ui/game-panel'
import { GamePill } from '@/shared/ui/game-pill'

function chipClass(active: boolean): string {
    return [
        'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 font-display text-sm transition-[border-color,background-color,box-shadow] duration-150',
        active
            ? 'border-primary bg-(image:--gradient-cta) text-on-primary shadow-raise-bar-primary'
            : 'border-border-action bg-surface-cream text-ink shadow-raise-bar-action hover:border-primary hover:bg-cream-hover',
    ].join(' ')
}

export function SpeciesView() {
    const router = useRouter()
    const reducedMotion = useReducedMotion()
    const { setSpecies } = useTestProgress()
    const [selected, setSelected] = useState<Species | null>(null)
    const [customName, setCustomName] = useState('')
    const [query, setQuery] = useState('')

    // Filter the named species by substring; '기타' is rendered separately and
    // always reachable so a missing species can still be entered by hand.
    const q = query.trim()
    const named = SPECIES_LIST.filter((s) => s !== '기타')
    const filtered = q ? named.filter((s) => s.includes(q)) : named

    const handleSelect = (species: Species) => {
        setSelected(species)
        if (species !== '기타') setCustomName('')
    }

    const handleConfirm = () => {
        if (!selected) return
        const name = selected === '기타' ? customName.trim() || null : null
        setSpecies(selected, name)
        track({ name: 'species_selected', payload: { species: selected } })
        router.push('/test')
    }

    const canConfirm = selected !== null && (selected !== '기타' || customName.trim().length > 0)

    return (
        <main className="flex min-h-dvh flex-col px-gutter pt-15 pb-10">
            <div className="flex items-center">
                <GameButton variant="icon" onClick={() => router.push('/')} aria-label="나가기">
                    ←
                </GameButton>
            </div>

            <div className="relative mt-7 -rotate-1">
                <span
                    aria-hidden="true"
                    className="absolute -top-2.5 left-1/2 z-1 size-5 -translate-x-1/2 rounded-full border-2 border-primary-active bg-[radial-gradient(circle_at_35%_30%,#ffe2c8,var(--color-gold)_55%,var(--color-primary-hover))] shadow-[0_3px_4px_rgba(58,46,26,0.35)]"
                />
                <GamePanel dashedFrame className="px-6 py-6">
                    <h1 className="m-0 font-display text-2xl leading-snug break-keep text-ink">
                        우리 앵무새 종은 무엇인가요?
                    </h1>
                    <p className="mt-1.5 text-sm text-ink-muted">
                        종에 따라 성격 성향이 조금씩 반영돼요.
                    </p>
                </GamePanel>
            </div>

            <div className="relative mt-6">
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg text-ink-muted"
                >
                    🔍
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="종 이름 검색"
                    aria-label="종 이름 검색"
                    className="w-full rounded-full border-2 border-border-action bg-surface-cream py-3 pr-4 pl-11 font-display text-base text-ink shadow-raise-cream-sm placeholder:text-ink-muted focus:border-primary focus:outline-none"
                />
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
                {filtered.map((species) => (
                    <m.button
                        key={species}
                        type="button"
                        onClick={() => handleSelect(species)}
                        whileTap={reducedMotion ? undefined : cardTap}
                        className={chipClass(selected === species)}
                    >
                        {species}
                    </m.button>
                ))}
                {filtered.length === 0 && (
                    <div className="w-full rounded-lg border-2 border-dashed border-border-action bg-surface-cream px-5 py-6 text-center">
                        <p className="font-display text-base text-ink">검색 결과가 없어요</p>
                        <p className="mt-1 text-sm text-ink-muted">
                            ‘{query.trim()}’ 대신 아래 ‘기타’로 등록해 주세요
                        </p>
                    </div>
                )}

                <m.button
                    type="button"
                    onClick={() => handleSelect('기타')}
                    whileTap={reducedMotion ? undefined : cardTap}
                    className={chipClass(selected === '기타')}
                >
                    기타 (직접 입력)
                </m.button>
            </div>

            {selected === '기타' && (
                <GamePanel className="mt-4 px-4 py-4">
                    <label
                        htmlFor="custom-species"
                        className="mb-2 block text-sm font-bold text-ink"
                    >
                        종 이름을 입력해 주세요
                    </label>
                    <input
                        id="custom-species"
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="예: 태양잉꼬"
                        maxLength={20}
                        className="w-full rounded-lg border-2 border-border-action bg-surface-cream px-3 py-2 font-display text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                    />
                </GamePanel>
            )}

            <div className="mt-auto pt-6">
                <div className="mb-3 flex justify-center">
                    {selected ? (
                        <GamePill variant="orange">
                            <span aria-hidden="true">✓</span> {selected} 선택됨
                        </GamePill>
                    ) : (
                        <GamePill variant="cream">
                            <span
                                aria-hidden="true"
                                className="font-display font-bold text-[#e5484d]"
                            >
                                X
                            </span>{' '}
                            종을 한 가지 골라 주세요
                        </GamePill>
                    )}
                </div>
                <GameButton className="w-full" onClick={handleConfirm} disabled={!canConfirm}>
                    {canConfirm ? (
                        <>
                            다음 <span aria-hidden="true">→</span>
                        </>
                    ) : (
                        <>
                            <span aria-hidden="true">🔒</span> 다음
                        </>
                    )}
                </GameButton>
            </div>
        </main>
    )
}
