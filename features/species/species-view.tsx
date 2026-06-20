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

            <h1 className="mt-8 font-display text-2xl leading-snug break-keep text-ink">
                우리 앵무새 종은 무엇인가요?
            </h1>
            <p className="mt-1 text-sm text-ink-muted">종에 따라 성격 성향이 조금씩 반영돼요.</p>

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
