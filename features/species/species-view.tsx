'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTestProgress } from '@/features/quiz/test-progress-context'
import { SPECIES_LIST, type Species } from '@/lib/mbti/species-weight'
import { track } from '@/shared/analytics'
import { GameButton } from '@/shared/ui/game-button'
import { GamePanel } from '@/shared/ui/game-panel'

export function SpeciesView() {
    const router = useRouter()
    const { setSpecies } = useTestProgress()
    const [selected, setSelected] = useState<Species | null>(null)
    const [customName, setCustomName] = useState('')

    const namedSpecies = SPECIES_LIST.filter((s) => s !== '기타')

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
            <div className="flex items-center gap-3">
                <GameButton variant="icon" onClick={() => router.push('/')} aria-label="나가기">
                    ←
                </GameButton>
            </div>

            <div className="relative mt-8 -rotate-1">
                <span
                    aria-hidden="true"
                    className="absolute -top-2.5 left-1/2 z-1 size-5 -translate-x-1/2 rounded-full border-2 border-primary-active bg-[radial-gradient(circle_at_35%_30%,#ffe2c8,var(--color-gold)_55%,var(--color-primary-hover))] shadow-[0_3px_4px_rgba(58,46,26,0.35)]"
                />
                <GamePanel dashedFrame className="px-6 py-7">
                    <h1 className="m-0 font-display text-2xl leading-snug break-keep text-ink">
                        우리 앵무새 종은 무엇인가요?
                    </h1>
                    <p className="mt-2 text-sm text-ink-muted">
                        종에 따라 성격 성향이 조금씩 반영돼요.
                    </p>
                </GamePanel>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2.5">
                {namedSpecies.map((species) => (
                    <button
                        key={species}
                        type="button"
                        onClick={() => handleSelect(species)}
                        className={[
                            'rounded-xl border-2 px-2 py-3 text-center font-display text-sm leading-tight transition-colors duration-150',
                            selected === species
                                ? 'border-primary bg-primary-soft text-primary-active'
                                : 'border-border-action bg-surface-cream text-ink hover:border-primary hover:bg-cream-hover',
                        ].join(' ')}
                    >
                        {species}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => handleSelect('기타')}
                    className={[
                        'rounded-xl border-2 px-2 py-3 text-center font-display text-sm leading-tight transition-colors duration-150',
                        selected === '기타'
                            ? 'border-primary bg-primary-soft text-primary-active'
                            : 'border-border-action bg-surface-cream text-ink hover:border-primary hover:bg-cream-hover',
                    ].join(' ')}
                >
                    기타
                </button>
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
                <GameButton className="w-full" onClick={handleConfirm} disabled={!canConfirm}>
                    다음 <span aria-hidden="true">→</span>
                </GameButton>
            </div>
        </main>
    )
}
