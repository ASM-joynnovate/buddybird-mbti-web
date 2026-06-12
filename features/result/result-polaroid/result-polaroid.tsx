'use client'

// Adaptive polaroid for the result hero (design handoff: result.jsx `.result-pola`
// solo + share-cards.jsx `Duo` merged into one component).
//
// - No photo (photoUrl === null): a single character polaroid (gradient photo
//   window + rays + bob).
// - With photo: two shots (left "📷 내 앵무새" pet photo cover -> right
//   "✨ {code} 캐릭터") showing before->after.
//
// Shared: white card (-2deg tilt), two washi tapes (orange/gold), caption
// (code/name). ADR-0008 (tailwind-only/Motion-owned): bob is Motion (`m.div`).
// Classes prefer standard utils — when no exact token/standard exists, snap to
// the nearest standard and allow a small shift (no arbitrary values). Only
// effects with no standard class at all stay arbitrary *properties*: rays
// (conic-gradient+mask), tape/vignette (repeating·radial gradient), shadows
// (multi-layer raised-block, ADR-0009 px exception). bob stops under reduced motion.
import type { CSSProperties } from 'react'
import { m } from 'motion/react'
import type { TypeCode } from '@/lib/mbti'
import { ParrotImage } from '@/shared/ui/parrot-image'

interface ResultPolaroidProps {
    type: TypeCode
    name: string
    /** `typeGradient(type)` CSS string — character photo-window background. */
    gradient: string
    /** Uploaded pet photo objectURL. null means a single character shot. */
    photoUrl: string | null
    reducedMotion: boolean
}

// Static ray burst (behind the character). conic-gradient + radial mask have no
// standard class, so they stay arbitrary properties. Width is a ratio of the
// parent (150%) so it is unit-independent.
const RAYS_CLASS =
    'pointer-events-none absolute top-6 left-1/2 z-1 aspect-square w-full -translate-x-1/2 rounded-full opacity-50 [background:conic-gradient(from_8deg,rgba(255,255,255,0.16)_0_7deg,transparent_7deg_30deg)] [-webkit-mask-image:radial-gradient(closest-side,#000_30%,transparent_72%)] [mask-image:radial-gradient(closest-side,#000_30%,transparent_72%)]'

// Photo gloss/vignette overlay (top highlight + bottom shade) — radial-gradient.
const VIGNETTE_CLASS =
    'pointer-events-none absolute inset-0 z-2 [background:radial-gradient(120%_80%_at_28%_8%,rgba(255,255,255,0.4),transparent_56%),radial-gradient(140%_90%_at_50%_122%,rgba(0,0,0,0.3),transparent_60%)]'

// before->after tag (bottom-center of the photo window).
const TAG_BASE =
    'absolute bottom-2.5 left-1/2 z-4 inline-flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-1 font-display text-xs whitespace-nowrap shadow-[0_3px_8px_rgba(0,0,0,0.2)]'

interface CharShotProps {
    type: TypeCode
    reducedMotion: boolean
}

// The character over the gradient photo window (rays + bob + vignette). The
// parent owns size/background.
function CharShot({ type, reducedMotion }: CharShotProps) {
    const image = (
        <ParrotImage
            type={type}
            width={300}
            height={300}
            loading="eager"
            className="h-full w-full object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.4)]"
        />
    )
    return (
        <>
            <span className={RAYS_CLASS} aria-hidden="true" />
            {reducedMotion ? (
                <div className="absolute inset-0 z-3">{image}</div>
            ) : (
                <m.div
                    className="absolute inset-0 z-3"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {image}
                </m.div>
            )}
            <span className={VIGNETTE_CLASS} aria-hidden="true" />
        </>
    )
}

export function ResultPolaroid({
    type,
    name,
    gradient,
    photoUrl,
    reducedMotion,
}: ResultPolaroidProps) {
    const charBg = { background: gradient } as CSSProperties

    return (
        <div
            data-testid="result-polaroid"
            className="relative mx-auto w-full max-w-96 -rotate-2 rounded-sm bg-white p-3.5 pb-0 shadow-[0_7px_0_var(--color-depth-action),0_24px_38px_-18px_rgba(40,20,8,0.5),inset_0_0_0_1px_rgba(0,0,0,0.03)]"
        >
            {/* Washi tape — t1 orange (left, -7deg) · t2 gold (right, 6deg);
                angles mirror compose-card's canvas tape. */}
            <span
                className="pointer-events-none absolute -top-3.5 left-8 z-4 h-10 w-32 -rotate-7 opacity-80 shadow-[0_4px_8px_rgba(0,0,0,0.16)] [background:repeating-linear-gradient(45deg,rgba(255,255,255,0.22)_0_10px,transparent_10px_20px),var(--color-primary)]"
                aria-hidden="true"
            />
            <span
                className="pointer-events-none absolute -top-3 right-8 z-4 h-10 w-28 rotate-6 opacity-80 shadow-[0_4px_8px_rgba(0,0,0,0.16)] [background:repeating-linear-gradient(45deg,rgba(255,255,255,0.22)_0_10px,transparent_10px_20px),var(--color-gold)]"
                aria-hidden="true"
            />

            {photoUrl !== null ? (
                <div className="flex h-60 gap-2.5">
                    {/* 내 앵무새 — uploaded pet photo (cover) */}
                    <div className="relative flex-1 overflow-hidden rounded-sm bg-surface-cream shadow-[inset_0_0_0_2px_rgba(0,0,0,0.05)]">
                        {/* data-clarity-mask: the pet photo must never appear in
                         * Clarity session recordings — the PRD promises photos are
                         * 100% client-side (ADR-0015). */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="absolute inset-0 h-full w-full object-cover"
                            src={photoUrl}
                            alt="내 앵무새 사진"
                            data-clarity-mask="True"
                        />
                        <span className={`${TAG_BASE} bg-white/90 text-ink`}>📷 내 앵무새</span>
                    </div>
                    {/* MBTI character */}
                    <div className="relative flex-1 overflow-hidden rounded-sm" style={charBg}>
                        <CharShot type={type} reducedMotion={reducedMotion} />
                        <span className={`${TAG_BASE} bg-ink/45 text-white`}>✨ {type} 캐릭터</span>
                    </div>
                </div>
            ) : (
                <div className="relative h-72 overflow-hidden rounded-sm" style={charBg}>
                    <CharShot type={type} reducedMotion={reducedMotion} />
                </div>
            )}

            {/* Caption — code + name */}
            <div className="flex flex-col items-center gap-0.5 px-1 pt-3 pb-4 text-center">
                <span
                    data-testid="result-type"
                    className="font-display text-4xl leading-none tracking-wide text-primary-active"
                >
                    {type}
                </span>
                <span className="font-display text-lg break-keep text-ink">{name}</span>
            </div>
        </div>
    )
}
