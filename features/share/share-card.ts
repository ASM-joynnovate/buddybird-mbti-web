// Shares the composed card via the Web Share API with files, falling back to a
// download when native file sharing is unavailable (issue #09). The web has no direct
// Instagram-post API, so this only ever opens the OS share sheet or saves the image.

import type { TypeCode } from '@/lib/mbti'

export type ShareOutcome =
    | { kind: 'shared' }
    | { kind: 'canceled' }
    | { kind: 'fallback'; reason: string }

export async function shareCard(blob: Blob, type: TypeCode): Promise<ShareOutcome> {
    const file = new File([blob], `buddybird-${type}.png`, { type: blob.type })

    // Desktop → download straight away; phones/tablets keep the native share sheet.
    // Desktop Chrome/Edge support canShare(files) too, so a pure feature-detect would
    // wrongly open a share sheet on a computer. Decide by User Agent instead.
    const isDesktop = !isMobileUserAgent()

    // Feature-detect at runtime: older browsers lack share/canShare entirely.
    const canShareFiles =
        !isDesktop &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })

    if (canShareFiles) {
        try {
            await navigator.share({
                files: [file],
                title: '우리 앵무새의 앵BTI 결과',
                text: `우리 앵무새는 ${type}! 너희 앵무새도 테스트해봐 🦜`,
            })
            return { kind: 'shared' }
        } catch (error) {
            // User dismissed the share sheet — not a failure, no download.
            if (error instanceof DOMException && error.name === 'AbortError') {
                return { kind: 'canceled' }
            }
            downloadFile(file)
            return { kind: 'fallback', reason: getErrorMessage(error) }
        }
    }

    downloadFile(file)
    return { kind: 'fallback', reason: isDesktop ? 'desktop-download' : 'web-share-unsupported' }
}

// Desktop vs. mobile by User Agent: UA Client Hints first (Chromium), then a UA-string
// fallback for browsers without it (Safari/Firefox). ponytail: iPadOS Safari reports a
// Mac UA, so it counts as desktop (download) — acceptable for "computer = download".
function isMobileUserAgent(): boolean {
    if (typeof navigator === 'undefined') {
        return false
    }
    const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData
    if (typeof uaData?.mobile === 'boolean') {
        return uaData.mobile
    }
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function downloadFile(file: File): void {
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = file.name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return 'share-failed'
}
