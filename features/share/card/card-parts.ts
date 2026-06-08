// Card-specific drawing pieces for the share-card compositor: paper, photo
// windows, rays, vignette, before/after tag, washi tape, brand stamp. Each is a
// pure draw onto the passed context; compose-card orchestrates their order.

import { drawContain, drawCover, roundRectPath } from './canvas-utils'
import {
    CARD_SIZE,
    CHAR_GRAD_FALLBACK,
    FONT_DISPLAY,
    INK,
    PAPER_FALLBACK,
    PAPER_STOPS,
    PET_PLACEHOLDER_BG,
    PRIMARY_ACTIVE,
} from './card-layout'

// Paper base (warm radial spreading from near the top).
export function paintPaper(ctx: CanvasRenderingContext2D): void {
    try {
        // radial-gradient(135% 95% at 50% -6%, …): warm radial from top center.
        const grad = ctx.createRadialGradient(
            CARD_SIZE / 2,
            -CARD_SIZE * 0.06,
            0,
            CARD_SIZE / 2,
            -CARD_SIZE * 0.06,
            CARD_SIZE * 1.15,
        )
        for (const [stop, color] of PAPER_STOPS) {
            grad.addColorStop(stop, color)
        }
        ctx.fillStyle = grad
    } catch {
        ctx.fillStyle = PAPER_FALLBACK
    }
    ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE)
}

// Character photo window: gradient -> rays -> character (contain) -> gloss/vignette.
// Rounded clip.
export function drawCharWindow(
    ctx: CanvasRenderingContext2D,
    character: HTMLImageElement | null,
    colors: readonly [string, string],
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
): void {
    ctx.save()
    roundRectPath(ctx, x, y, w, h, r)
    ctx.clip()

    const grad = ctx.createLinearGradient(x, y, x + w, y + h)
    grad.addColorStop(0, colors[0] || CHAR_GRAD_FALLBACK[0])
    grad.addColorStop(1, colors[1] || CHAR_GRAD_FALLBACK[1])
    ctx.fillStyle = grad
    ctx.fillRect(x, y, w, h)

    drawRays(ctx, x + w / 2, y + h * 0.18, w * 0.82)

    if (character !== null) {
        drawContain(ctx, character, x + w * 0.06, y + h * 0.06, w * 0.88, h * 0.88)
    } else {
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        ctx.font = `${Math.round(h * 0.4)}px ${FONT_DISPLAY}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🦜', x + w / 2, y + h / 2)
    }

    drawVignette(ctx, x, y, w, h)
    ctx.restore()
}

// Pet photo window: cover-crop. Rounded clip.
export function drawPetWindow(
    ctx: CanvasRenderingContext2D,
    photo: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
): void {
    ctx.save()
    roundRectPath(ctx, x, y, w, h, r)
    ctx.clip()
    ctx.fillStyle = PET_PLACEHOLDER_BG
    ctx.fillRect(x, y, w, h)
    drawCover(ctx, photo, x, y, w, h)
    ctx.restore()
}

// Static ray burst (thin white wedges). Canvas approximation of a conic-gradient.
function drawRays(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    ctx.save()
    // Single alpha source: 0.5 * 0.16 would double-multiply, so paint the wedges
    // at their effective opacity directly with globalAlpha left at 1.
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    const start = (8 * Math.PI) / 180
    const wedge = (7 * Math.PI) / 180
    const step = (30 * Math.PI) / 180
    for (let a = start; a < start + Math.PI * 2; a += step) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, radius, a, a + wedge)
        ctx.closePath()
        ctx.fill()
    }
    ctx.restore()
}

// Photo gloss/vignette (top highlight + bottom shade). Already clipped at call time.
function drawVignette(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
): void {
    const hi = ctx.createRadialGradient(
        x + w * 0.28,
        y + h * 0.08,
        0,
        x + w * 0.28,
        y + h * 0.08,
        w * 0.9,
    )
    hi.addColorStop(0, 'rgba(255,255,255,0.4)')
    hi.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = hi
    ctx.fillRect(x, y, w, h)

    const lo = ctx.createRadialGradient(
        x + w * 0.5,
        y + h * 1.05,
        0,
        x + w * 0.5,
        y + h * 1.05,
        h * 0.95,
    )
    lo.addColorStop(0, 'rgba(0,0,0,0.32)')
    lo.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = lo
    ctx.fillRect(x, y, w, h)
}

// before/after tag (rounded pill + text). Bottom-center of the photo window.
export function drawTag(
    ctx: CanvasRenderingContext2D,
    text: string,
    cx: number,
    cy: number,
    onChar: boolean,
): void {
    const fontSize = 23
    ctx.font = `${fontSize}px ${FONT_DISPLAY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const padX = 18
    const w = ctx.measureText(text).width + padX * 2
    const h = fontSize + 16
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 3
    ctx.fillStyle = onChar ? 'rgba(20,14,8,0.55)' : 'rgba(255,253,247,0.95)'
    roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, h / 2)
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = onChar ? '#ffffff' : INK
    ctx.fillText(text, cx, cy + 1)
}

// Washi tape — rotated rectangle + diagonal stripe pattern.
export function drawTape(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    rotate: number,
    color: string,
): void {
    ctx.save()
    ctx.translate(x + w / 2, y + h / 2)
    ctx.rotate(rotate)
    ctx.globalAlpha = 0.82
    ctx.shadowColor = 'rgba(0,0,0,0.16)'
    ctx.shadowBlur = 9
    ctx.shadowOffsetY = 4
    ctx.fillStyle = color
    ctx.fillRect(-w / 2, -h / 2, w, h)
    // Diagonal white stripes (semi-transparent).
    ctx.shadowColor = 'transparent'
    ctx.beginPath()
    ctx.rect(-w / 2, -h / 2, w, h)
    ctx.clip()
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 10
    for (let i = -h; i < w; i += 20) {
        ctx.beginPath()
        ctx.moveTo(-w / 2 + i, -h / 2 - 2)
        ctx.lineTo(-w / 2 + i + h + 4, h / 2 + 2)
        ctx.stroke()
    }
    ctx.restore()
}

// Round brand stamp (dashed circle + 버디버드 / MBTI).
export function drawStamp(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
): void {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((9 * Math.PI) / 180)
    ctx.fillStyle = 'rgba(255,253,247,0.78)'
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.setLineDash([10, 8])
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(168,78,22,0.55)'
    ctx.beginPath()
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = PRIMARY_ACTIVE
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `28px ${FONT_DISPLAY}`
    ctx.fillText('버디버드', 0, -8)
    ctx.font = `16px ${FONT_DISPLAY}`
    ctx.globalAlpha = 0.85
    ctx.fillText('MBTI', 0, 18)
    ctx.restore()
}
