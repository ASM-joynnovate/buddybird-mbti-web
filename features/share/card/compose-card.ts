// Composes the 1080×1080 share card on a client Canvas (issue #09): a cover-cropped
// parrot photo hero over a temperament-colored band with the type, name, copy, and
// BuddyBird branding. Returns a PNG Blob. Same-origin inputs only (blob: photo,
// /brand logo) so the canvas is never tainted and toBlob can read it back.

import type { TypeCode } from '@/lib/mbti'
import { BAND, BAND_TEXT, CARD_BG, CARD_SIZE, HERO, HERO_PLACEHOLDER_BG } from './card-layout'

interface ComposeCardInput {
    type: TypeCode
    typeName: string
    copy: string
    photo: HTMLImageElement | null
    bandHex: string
    logo: HTMLImageElement | null
}

export async function composeCard(input: ComposeCardInput): Promise<Blob> {
    // Load the brand fonts before drawing — otherwise the first compose silently
    // renders with a fallback face.
    if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready
        try {
            await Promise.all([
                document.fonts.load('116px "Jua"'),
                document.fonts.load('700 32px "Noto Sans KR"'),
            ])
        } catch {
            // Font load is best-effort; fall back to whatever is available.
        }
    }

    const canvas = document.createElement('canvas')
    canvas.width = CARD_SIZE
    canvas.height = CARD_SIZE
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
        throw new Error('Canvas 2D context unavailable')
    }

    ctx.fillStyle = CARD_BG
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE)

    // Photo hero (rounded, cover-cropped) or a placeholder mark.
    ctx.save()
    roundRectPath(ctx, HERO.x, HERO.y, HERO.w, HERO.h, HERO.radius)
    ctx.clip()
    if (input.photo !== null) {
        drawCover(ctx, input.photo, HERO.x, HERO.y, HERO.w, HERO.h)
    } else {
        ctx.fillStyle = HERO_PLACEHOLDER_BG
        ctx.fillRect(HERO.x, HERO.y, HERO.w, HERO.h)
        ctx.fillStyle = '#4c6151'
        ctx.font = '200px "Jua", system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🦜', HERO.x + HERO.w / 2, HERO.y + HERO.h / 2)
    }
    ctx.restore()

    // Info band.
    roundRectPath(ctx, BAND.x, BAND.y, BAND.w, BAND.h, BAND.radius)
    ctx.fillStyle = input.bandHex
    ctx.fill()

    const cx = BAND.x + BAND.w / 2
    ctx.fillStyle = BAND_TEXT
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    ctx.font = '116px "Jua", system-ui, sans-serif'
    ctx.fillText(input.type, cx, BAND.y + 138)

    ctx.font = '46px "Jua", system-ui, sans-serif'
    ctx.fillText(input.typeName, cx, BAND.y + 198)

    ctx.font = '400 32px "Noto Sans KR", system-ui, sans-serif'
    wrapText(ctx, input.copy, cx, BAND.y + 252, BAND.w - 140, 44, 2)

    // Brand footer (logo mark if provided, else wordmark text).
    ctx.font = '700 30px "Noto Sans KR", system-ui, sans-serif'
    ctx.globalAlpha = 0.92
    if (input.logo !== null) {
        const logoH = 40
        const logoW = (input.logo.naturalWidth / input.logo.naturalHeight) * logoH
        ctx.drawImage(input.logo, cx - logoW / 2, BAND.y + BAND.h - 60, logoW, logoH)
    } else {
        ctx.fillText('버디버드 앵무새 MBTI', cx, BAND.y + BAND.h - 34)
    }
    ctx.globalAlpha = 1

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (blob === null) {
        throw new Error('Canvas toBlob returned null')
    }
    return blob
}

// --- Canvas helpers ---

function roundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
): void {
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r)
        return
    }
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
}

// Draw `img` covering the destination rect, center-cropping the overflow.
function drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
): void {
    const imageRatio = img.naturalWidth / img.naturalHeight
    const destRatio = dw / dh

    let sx = 0
    let sy = 0
    let sw = img.naturalWidth
    let sh = img.naturalHeight

    if (imageRatio > destRatio) {
        sw = sh * destRatio
        sx = (img.naturalWidth - sw) / 2
    } else {
        sh = sw / destRatio
        sy = (img.naturalHeight - sh) / 2
    }

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

// Center-wrap `text` to at most `maxLines`, char by char (Korean has no word breaks),
// ellipsizing the final line when it overflows.
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    cx: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number,
): void {
    const lines: string[] = []
    let line = ''

    for (const char of [...text]) {
        const candidate = line + char
        if (line !== '' && ctx.measureText(candidate).width > maxWidth) {
            lines.push(line)
            line = char
        } else {
            line = candidate
        }
    }
    if (line !== '') {
        lines.push(line)
    }

    const clipped = lines.slice(0, maxLines)
    if (lines.length > maxLines && clipped.length > 0) {
        clipped[clipped.length - 1] = `${clipped[clipped.length - 1].slice(0, -1)}…`
    }

    clipped.forEach((entry, index) => {
        ctx.fillText(entry, cx, y + index * lineHeight)
    })
}
