'use client'

// Result-card share trigger (issue #09). Composes the 1080×1080 card from the type +
// optional photo, then shares it natively or downloads it as a fallback, emitting the
// matching funnel event (issue #11). Works with no photo (placeholder hero).
import { useState } from 'react'
import { getTypeInfo, parrotImageSrc } from '@/content'
import { shareCard } from '@/features/share'
import { CHAR_GRAD_FALLBACK, composeCard, loadImage } from '@/features/share/card'
import type { TypeCode } from '@/lib/mbti'
import { track } from '@/shared/analytics'
import { GameButton } from '@/shared/ui/game-button'

interface ShareButtonProps {
    type: TypeCode
    photoUrl: string | null
}

export function ShareButton({ type, photoUrl }: ShareButtonProps) {
    const [busy, setBusy] = useState(false)
    const [hint, setHint] = useState<string | null>(null)

    const handleShare = async () => {
        if (busy) {
            return
        }
        setBusy(true)
        setHint(null)

        try {
            const info = getTypeInfo(type)
            const photo = photoUrl !== null ? await loadImage(photoUrl).catch(() => null) : null
            const character = await loadImage(parrotImageSrc(type)).catch(() => null)

            const blob = await composeCard({
                type,
                typeName: info?.name ?? type,
                copy: info?.report ?? '',
                photo,
                character,
                colors: info?.colors ?? CHAR_GRAD_FALLBACK,
            })

            const outcome = await shareCard(blob, type)
            if (outcome.kind === 'shared') {
                track({ name: 'share_success', payload: { type } })
            } else if (outcome.kind === 'fallback') {
                track({ name: 'share_fallback', payload: { type, reason: outcome.reason } })
                setHint('카드를 저장했어요. 인스타그램에 올려 주세요!')
            } else {
                // 'canceled' — user dismissed the share sheet (UI stays quiet,
                // but the funnel leak is worth measuring).
                track({ name: 'share_cancel', payload: { type } })
            }
        } catch {
            // Card composition failed (image decode, canvas, etc.).
            track({ name: 'share_error', payload: { type } })
            setHint('카드를 만들지 못했어요. 잠시 후 다시 시도해 주세요.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="flex w-full flex-col gap-2">
            <GameButton
                variant="secondary"
                size="sm"
                className="w-full"
                data-testid="share-button"
                onClick={handleShare}
                disabled={busy}
            >
                {busy ? '카드 만드는 중…' : '친구에게 공유하기'} <span aria-hidden="true">↗</span>
            </GameButton>
            {hint !== null && (
                <p
                    className="m-0 text-center text-sm text-ink-muted"
                    role="status"
                    data-testid="share-hint"
                >
                    {hint}
                </p>
            )}
        </div>
    )
}
