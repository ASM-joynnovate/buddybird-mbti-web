'use client'

// Parrot dex (도감) — a 16-type grid where each card carries its identity gradient
// wash; tapping a card opens the shared TypeModal. Funnel side-branch: reachable
// from the intro ("16유형 도감 보기") and the result page ("도감에서 보기",
// /dex?mine=CODE highlights the visitor's own type). A /dex?focus=CODE deep-link
// (used by MatchChips) auto-opens that type's modal.
import { useState, type CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { GameButton } from '@/components/game-button'
import { ParrotImage } from '@/components/parrot-image'
import { TypeModal } from '@/components/type-modal'
import { CAROUSEL_TYPES, getTypeInfo, typeGradient } from '@/content'
import { cardHover, cardTap, fadeOnly, fadeUp, staggerContainer } from '@/lib/motion'
import './dex.css'

export function DexView() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const reducedMotion = useReducedMotion()
    const mine = searchParams.get('mine')
    const focusParam = searchParams.get('focus')

    // Card entrance: staggered fadeUp; degrades to opacity-only under
    // prefers-reduced-motion (issue #21 convention, ADR-0006).
    const cardEntrance = reducedMotion ? fadeOnly : fadeUp

    // The focused type drives the modal. It starts from the ?focus deep-link and
    // re-syncs when that param changes (a MatchChip navigating to /dex?focus=OTHER
    // while already on this page). Card taps and Close set it locally — keeping the
    // ?mine highlight in the URL untouched. This is React's render-time
    // state-adjustment pattern (no effect, so no cascading-render lint warning).
    const [focused, setFocused] = useState<string | null>(focusParam)
    const [syncedFocus, setSyncedFocus] = useState<string | null>(focusParam)
    if (focusParam !== syncedFocus) {
        setSyncedFocus(focusParam)
        setFocused(focusParam)
    }

    const handleClose = () => setFocused(null)

    return (
        <main data-testid="dex-root" className="dex-surface">
            <header className="dex-head">
                <p className="dex-eyebrow">16 유형 도감</p>
                <h1 className="dex-title font-display">앵무새 도감</h1>
                <p className="dex-sub">카드를 탭하면 자세히 볼 수 있어요</p>
            </header>

            <m.div
                className="dex-grid"
                data-testid="dex-grid"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {CAROUSEL_TYPES.map((code) => {
                    const info = getTypeInfo(code)
                    const isMine = code === mine
                    const style = { '--type-grad': typeGradient(code) } as CSSProperties

                    return (
                        <m.button
                            key={code}
                            type="button"
                            className={isMine ? 'dex-card mine' : 'dex-card'}
                            style={style}
                            variants={cardEntrance}
                            whileHover={reducedMotion ? undefined : cardHover}
                            whileTap={reducedMotion ? undefined : cardTap}
                            onClick={() => setFocused(code)}
                            data-testid={`dex-card-${code}`}
                        >
                            {isMine && <span className="dex-mine-tag">내 유형</span>}
                            <span className="dex-card-art">
                                <ParrotImage type={code} width={184} height={184} />
                            </span>
                            <span className="dex-card-code font-display">{code}</span>
                            <span className="dex-card-name">{info?.name}</span>
                        </m.button>
                    )
                })}
            </m.div>

            <div className="dex-actions">
                <GameButton
                    variant="secondary"
                    onClick={() => router.push('/')}
                    data-testid="dex-back"
                >
                    ← 돌아가기
                </GameButton>
            </div>

            {/* AnimatePresence keeps the modal mounted through its exit leg
                (issue #25) — open/close both animate; keyed by type so a
                ?focus deep-link swap while open cross-fades cleanly. */}
            <AnimatePresence>
                {focused !== null && (
                    <TypeModal key={focused} code={focused} onClose={handleClose} />
                )}
            </AnimatePresence>
        </main>
    )
}
