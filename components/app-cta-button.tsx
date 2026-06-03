'use client'

// Shared BuddyBird app CTA, used on both the intro and result surfaces. Keeping the
// `app_cta_click` emit in one place guarantees the funnel event fires with a correct
// placement no matter where the CTA is rendered (issue #06/#07/#11). The link target
// is a single placeholder constant swapped in issue #10.
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
        <a
            href={APP_CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`app-cta-${placement}`}
            onClick={handleClick}
            className="inline-flex items-center gap-2 rounded-full border border-outline bg-[var(--color-surface)] px-6 py-3 text-sm font-bold text-ink shadow-[var(--shadow-leaf-low)] transition-transform focus-visible:[outline:3px_solid_var(--color-primary)] focus-visible:[outline-offset:2px] active:scale-[0.98]"
        >
            <span aria-hidden="true">🐦</span>
            {APP_CTA_LABEL}
        </a>
    )
}
