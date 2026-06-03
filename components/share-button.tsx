'use client'

// Result-card share trigger (issue #09). Composes the 1080×1080 card from the type +
// optional photo, then shares it natively or downloads it as a fallback, emitting the
// matching funnel event (issue #11). Works with no photo (placeholder hero).
import { useState } from 'react'
import { BRAND_LOGO_SRC, getTypeInfo } from '@/content'
import { track } from '@/lib/analytics'
import { composeCard, loadImage } from '@/lib/card'
import { GROUP_TEXT_SAFE_HEX, temperamentGroup, type TypeCode } from '@/lib/mbti'
import { shareCard } from '@/lib/share'

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
            const logo = await loadImage(BRAND_LOGO_SRC).catch(() => null)

            const blob = await composeCard({
                type,
                typeName: info?.name ?? type,
                copy: info?.report ?? '',
                photo,
                bandHex: GROUP_TEXT_SAFE_HEX[temperamentGroup(type)],
                logo,
            })

            const outcome = await shareCard(blob, type)
            if (outcome.kind === 'shared') {
                track({ name: 'share_success', payload: { type } })
            } else if (outcome.kind === 'fallback') {
                track({ name: 'share_fallback', payload: { type, reason: outcome.reason } })
                setHint('카드를 저장했어요. 인스타그램에 올려 주세요!')
            }
            // 'canceled' — user dismissed the share sheet; stay quiet.
        } catch {
            setHint('카드를 만들지 못했어요. 잠시 후 다시 시도해 주세요.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="share">
            <button
                type="button"
                data-testid="share-button"
                className="share-button"
                onClick={handleShare}
                disabled={busy}
            >
                {busy ? '카드 만드는 중…' : '결과 카드 공유하기'}
            </button>
            {hint !== null && (
                <p className="share-hint" role="status" data-testid="share-hint">
                    {hint}
                </p>
            )}
        </div>
    )
}
