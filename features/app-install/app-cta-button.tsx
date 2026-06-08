'use client'

// Shared BuddyBird app CTA, used on both the intro and result surfaces. Keeping the
// `app_cta_click` emit in one place guarantees the funnel event fires with a correct
// placement no matter where the CTA is rendered (issue #06/#07/#11). The link target
// is a single placeholder constant swapped in issue #10.
// Direct content import (not via the feature's own public barrel) — these
// constants live in content/ now (ADR-0011); a file importing its own feature
// barrel is the consumer-facing surface, not the intra-feature path.
import { APP_CTA_LABEL, APP_CTA_URL } from '@/content/cta'
import { track } from '@/shared/analytics'
import { useRemoteConfigString } from '@/shared/firebase'
import { GameButtonLink } from '@/shared/ui/game-button'

interface AppCtaButtonProps {
    placement: 'intro' | 'result'
}

export function AppCtaButton({ placement }: AppCtaButtonProps) {
    // Result CTA copy is the first Remote Config experiment surface (ADR-0011).
    // The intro CTA stays on the static label: it renders immediately on load,
    // where a late remote value would flicker the copy.
    const remoteResultLabel = useRemoteConfigString('result_cta_label')
    const label = placement === 'result' ? remoteResultLabel : APP_CTA_LABEL

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
            {label}
        </GameButtonLink>
    )
}
