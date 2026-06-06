'use client'

// Shared BuddyBird app CTA, used on both the intro and result surfaces. Keeping the
// `app_cta_click` emit in one place guarantees the funnel event fires with a correct
// placement no matter where the CTA is rendered (issue #06/#07/#11). The link target
// is a single placeholder constant swapped in issue #10.
import { GameButtonLink } from '@/components/ui/game-button'
import { track } from '@/lib/analytics'
import { APP_CTA_LABEL, APP_CTA_URL } from '@/lib/app-cta'

interface AppCtaButtonProps {
    placement: 'intro' | 'result'
}

export function AppCtaButton({ placement }: AppCtaButtonProps) {
    const handleClick = () => {
        track({ name: 'app_cta_click', payload: { placement } })
    }

    return (
        <GameButtonLink
            variant="secondary"
            size="sm"
            href={APP_CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`app-cta-${placement}`}
            onClick={handleClick}
        >
            <span aria-hidden="true">🐦</span>
            {APP_CTA_LABEL}
        </GameButtonLink>
    )
}
