'use client'

// One A/B choice row for the quiz — outline card with a hook punch line over a
// body description (NEXON Lv2 Gothic), plus the "도장 쾅" tap feedback: press-in,
// spring rebound, and a check stamp slamming onto the letter tile with an ink
// ring (winner of the 2026-06-07 Choice Row prototype round). Pure presentation;
// TestView owns the pick/advance engine and passes the picked state down.
import { m } from 'motion/react'
import type { Choice } from '@/lib/mbti'
import { easeLeaf, easeSpring } from '@/shared/motion'

// Choice press-in — deeper sink than before (y4/0.97): the press and the
// stamp-slam rebound together make the tap read as an event, not a state fade
// (2026-06-07 Choice Row prototype round, recipe "도장 쾅").
const choiceTap = { y: 4, scale: 0.97, transition: { duration: 0.09, ease: easeLeaf } }

// Full class string per state (prettier-plugin-tailwindcss compatible — no
// conditional fragments). Type lives on the inner hook/body spans.
const CHOICE_CLASS =
    'relative flex cursor-pointer items-center gap-3.5 rounded-lg border-2 border-border-action bg-surface-cream px-4 py-3.5 text-left text-ink shadow-[0_5px_0_var(--color-depth-action),0_12px_22px_-14px_rgba(58,46,26,0.35)] transition-[border-color,background-color,box-shadow] duration-150 ease-leaf hover:border-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel disabled:cursor-not-allowed'
const CHOICE_PICKED_CLASS =
    'relative flex cursor-pointer items-center gap-3.5 rounded-lg border-2 border-primary bg-cream-hover px-4 py-3.5 text-left text-ink shadow-[0_1px_0_var(--color-depth-action),0_0_0_3px_var(--color-primary-glow)] transition-[border-color,background-color,box-shadow] duration-150 ease-leaf focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel disabled:cursor-not-allowed'

const LETTER_CLASS =
    'grid size-10 flex-none place-items-center rounded-sm border-2 border-primary bg-white font-display text-lg leading-none text-primary-active shadow-[0_2px_0_var(--color-depth-action)] transition-[background-color,color] duration-150 ease-leaf'
const LETTER_PICKED_CLASS =
    'grid size-10 flex-none place-items-center rounded-sm border-2 border-primary bg-primary font-display text-lg leading-none text-on-primary shadow-raise-bar-primary transition-[background-color,color] duration-150 ease-leaf'

interface QuizChoiceProps {
    choice: Choice
    /** 0 -> "A", 1 -> "B" letter tile. */
    index: number
    /** Chosen choice id during the brief select window, or null. */
    picked: string | null
    reducedMotion: boolean
    onPick: (choice: Choice) => void
}

export function QuizChoice({ choice, index, picked, reducedMotion, onPick }: QuizChoiceProps) {
    const isPicked = picked === choice.id
    const interactive = picked === null && !reducedMotion

    return (
        <m.button
            type="button"
            // During the select window the choice- testid is swapped off so the
            // E2E poller waits for the next question instead of clicking the
            // now-disabled button.
            data-testid={picked !== null ? `opt-${choice.id}` : `choice-${choice.id}`}
            aria-label={choice.label}
            onClick={() => onPick(choice)}
            disabled={picked !== null}
            className={isPicked ? CHOICE_PICKED_CLASS : CHOICE_CLASS}
            whileTap={interactive ? choiceTap : undefined}
            // Stamp-slam rebound: the row never holds the pressed pose (a 300ms+
            // hold reads as jank against the 420ms advance) — it springs back
            // while the stamp carries "selected".
            animate={isPicked && !reducedMotion ? { y: [4, 0], scale: [0.97, 1] } : { y: 0 }}
            transition={{ duration: 0.2, ease: easeSpring }}
        >
            {/* Plain A/B letter tiles — never MBTI axis tags (DESIGN.md). */}
            <span className="relative flex-none" aria-hidden="true">
                <span className={isPicked ? LETTER_PICKED_CLASS : LETTER_CLASS}>
                    {index === 0 ? 'A' : 'B'}
                </span>
                {isPicked && (
                    <>
                        {/* Check stamp slams onto the tile (1.45->1, -8deg->-3deg). */}
                        <m.span
                            className="absolute inset-0 grid place-items-center rounded-sm bg-primary text-xl leading-none font-bold text-on-primary shadow-raise-bar-primary"
                            initial={
                                reducedMotion
                                    ? { opacity: 1, rotate: -3 }
                                    : { scale: 1.45, rotate: -8, opacity: 0 }
                            }
                            animate={{ scale: 1, rotate: -3, opacity: 1 }}
                            transition={{ duration: 0.23, ease: easeSpring }}
                        >
                            ✓
                        </m.span>
                        {/* Ink ring puffs out and fades. */}
                        {!reducedMotion && (
                            <m.span
                                className="absolute -inset-1.5 rounded-lg border-2 border-primary"
                                initial={{ scale: 0.8, opacity: 0.6 }}
                                animate={{ scale: 1.3, opacity: 0 }}
                                transition={{ duration: 0.25, ease: easeLeaf }}
                            />
                        )}
                    </>
                )}
            </span>
            {/* Hook (punch line) over body (description) — NEXON Lv2 Gothic carries
                both; label is the fallback when a choice has no split. */}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 [font-family:var(--font-nexon),var(--font-sans)] break-keep">
                <b className="text-lg leading-snug font-bold text-ink">
                    {choice.hook ?? choice.label}
                </b>
                {choice.body !== undefined && (
                    <span className="text-sm leading-normal font-normal text-ink-muted">
                        {choice.body}
                    </span>
                )}
            </span>
        </m.button>
    )
}
