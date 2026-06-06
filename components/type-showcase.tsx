'use client'

// Intro type showcase (issues #14/#15/#16). Owns the single active-type index that
// both the active card and the centre-fixed peek carousel read, so the card and the
// highlighted middle tile always name the same type. The carousel auto-advances one
// tile every interval, slides on a compositor-friendly transform only, and loops
// seamlessly: the pool is tripled and a silent reset (transition suppressed for one
// frame) jumps the position back into the middle copy at an identical cell, so the
// wrap is invisible. Tap interaction + the remaining a11y affordances land in #16.
import { useEffect, useState, type CSSProperties, type TransitionEvent } from 'react'
import { m, useReducedMotion as useMotionReducedMotion } from 'motion/react'
import { ParrotImage } from '@/components/parrot-image'
import { getTypeInfo, typeGradient } from '@/content'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import type { TypeCode } from '@/lib/mbti'
import { GROUP_CSS_VAR, temperamentGroup } from '@/lib/mbti/temperament'
import { fadeOnly, fadeUp } from '@/lib/motion'
import './type-showcase.css'

interface TypeShowcaseProps {
    pool: readonly TypeCode[]
    intervalMs?: number
}

// Peek tile geometry, mirrored in type-showcase.css: a 56px tile plus a 12px gap is
// a 68px pitch; half a tile (28px) centres the active cell under the viewport middle.
const PEEK_PITCH = 68
const PEEK_HALF = 28

export function TypeShowcase({ pool, intervalMs = 3000 }: TypeShowcaseProps) {
    // Two reduced-motion hooks by convention (ADR-0006): the local hook drives
    // non-Motion orchestration (auto-advance pause), Motion's own hook drives the
    // m.* entrance variants. Both read the same media query and cannot disagree.
    const reduced = useReducedMotion()
    const motionReduced = useMotionReducedMotion()
    const len = pool.length
    // Triple the pool so the active (centre) cell always has neighbours to peek on
    // both sides, and the silent reset has an identical cell to jump to.
    const loop = [...pool, ...pool, ...pool]

    // pos is an absolute index into `loop`; it starts at the first type of the middle
    // copy. `paused` halts auto-advance on hover/focus; `animate` is switched off for
    // a single frame during the silent reset so the wrap jump is not tweened.
    const [pos, setPos] = useState(len)
    const [paused, setPaused] = useState(false)
    const [animate, setAnimate] = useState(true)

    // KEPT INTENTIONALLY through the Motion pass (issues #19–#27, user decision +
    // ADR-0005): this setInterval and the silent-reset rAF below are STATE
    // orchestration for the infinite carousel, not animation — the visible motion
    // is a compositor-friendly CSS transform transition. Do not port to Motion.
    useEffect(() => {
        if (reduced || paused || len <= 1) {
            return
        }
        const timer = setInterval(() => setPos((prev) => prev + 1), intervalMs)
        return () => clearInterval(timer)
    }, [reduced, paused, len, intervalMs])

    // Re-enable the transition on the next frame after a silent jump. The rendered
    // cell is identical before and after, so no motion is seen.
    useEffect(() => {
        if (animate) {
            return
        }
        const raf = requestAnimationFrame(() => setAnimate(true))
        return () => cancelAnimationFrame(raf)
    }, [animate])

    // When the slide settles in the trailing copy (or before the leading one), snap
    // back by one pool length to the matching cell in the middle copy, transition off.
    // Only the track's OWN transform transition counts: each peek tile also tweens
    // opacity/transform on (de)emphasis and those events bubble here, so without the
    // target/property guard the reset would fire several times per slide and overshoot
    // `pos` out of range (losing the centred cell entirely).
    const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget || event.propertyName !== 'transform') {
            return
        }
        if (pos >= 2 * len) {
            setAnimate(false)
            setPos((prev) => prev - len)
        } else if (pos < len) {
            setAnimate(false)
            setPos((prev) => prev + len)
        }
    }

    const active = pool[((pos % len) + len) % len]
    const info = active !== undefined ? getTypeInfo(active) : null

    if (active === undefined) {
        return null
    }

    const trackStyle = {
        transform: `translateX(calc(-1 * (${pos} * ${PEEK_PITCH}px + ${PEEK_HALF}px)))`,
        // Suppress the tween for the silent reset frame only.
        transition: animate ? undefined : 'none',
    }

    // Temperament-group feather hue carries the active type's identity (DESIGN.md):
    // it tints the card's outer/inner picture frames, the nameplate chip, the
    // character-window ring, and the centred peek tile's selection ring, so the
    // active type reads as a distinct "faction" (orange stays reserved for
    // user-chosen states).
    const accentStyle = {
        '--showcase-accent': GROUP_CSS_VAR[temperamentGroup(active)],
    } as CSSProperties

    return (
        <section
            className="showcase"
            data-testid="intro-showcase"
            style={accentStyle}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            {/* Active-card swap entrance (issue #22): the card is keyed by type, so
             * each swap remounts it and replays the shared fadeUp (opacity-only
             * under reduced motion) — replacing the old showcase-card-fade
             * keyframe. The carousel track below stays CSS-transition driven
             * (ADR-0005: setInterval + silent reset are NOT Motion's concern). */}
            <m.div
                className="showcase-card"
                data-testid="showcase-active-card"
                key={active}
                variants={motionReduced ? fadeOnly : fadeUp}
                initial="hidden"
                animate="visible"
            >
                <figure className="showcase-card-figure">
                    <span
                        className="showcase-card-thumb"
                        style={{ background: typeGradient(active) }}
                    >
                        <ParrotImage type={active} width={120} height={120} loading="eager" />
                    </span>
                </figure>

                <div className="showcase-card-body">
                    <p className="showcase-card-head">
                        <span className="showcase-card-code font-display">{active}</span>
                        <span className="showcase-card-sep" aria-hidden="true">
                            |
                        </span>
                        <span className="showcase-card-name">{info?.name ?? active}</span>
                    </p>
                    {info !== null && <p className="showcase-card-desc">{info.report}</p>}
                </div>
            </m.div>

            <div className="showcase-peek-viewport">
                <div
                    className="showcase-peek-track"
                    style={trackStyle}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {loop.map((code, p) => (
                        <button
                            // p is stable per render position; the cell content is
                            // governed by `code`, so a positional key is correct here.
                            key={p}
                            type="button"
                            className={p === pos ? 'peek is-active' : 'peek'}
                            style={{ background: typeGradient(code) }}
                            // Tapping a tile activates its type immediately: the slide
                            // recentres on it and the active card follows the shared
                            // index. An out-of-range pos is normalised by the same
                            // silent-reset path on the next transition end.
                            aria-pressed={p === pos}
                            aria-label={`${code} ${getTypeInfo(code)?.name ?? ''}`.trim()}
                            onClick={() => setPos(p)}
                        >
                            <ParrotImage
                                type={code}
                                width={56}
                                height={56}
                                loading={Math.abs(p - len) <= 3 ? 'eager' : 'lazy'}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <p className="showcase-caption" data-testid="showcase-caption" aria-live="polite">
                {active} {info?.name ?? ''}
            </p>
        </section>
    )
}
