// Share-card composition (design handoff Design B "polaroid scrapbook",
// 1080x1080). Warm paper -> slightly tilted white polaroid card (2 washi tapes +
// round brand stamp) -> photo window (solo: one character / duo: my parrot cover
// -> character, before->after) -> caption (code/name/tagline). Returns a PNG Blob.
//
// Only same-origin inputs are used (blob: pet photo, /parrots-mbti-charactor/*,
// /brand) so the canvas stays untainted and is readable back via toBlob. Uses the
// same tokens as the on-screen ResultPolaroid (tape/tag/gradient/caption hierarchy)
// so the two outputs read as one design.

import type { TypeCode } from '@/lib/mbti'
import { loadFonts, roundRectPath, wrapLines } from './canvas-utils'
import {
    CAP_BOTTOM_PAD,
    CAP_CODE_SIZE,
    CAP_NAME_SIZE,
    CAP_TAG_LINE,
    CAP_TAG_SIZE,
    CAP_TOP_PAD,
    CARD_BG,
    CARD_PAD,
    CARD_RADIUS,
    CARD_ROTATE,
    CARD_SIZE,
    CARD_W,
    CARD_X,
    DUO_GAP,
    DUO_PHOTO_H,
    DUO_PHOTO_R,
    FONT_BODY,
    FONT_DISPLAY,
    GOLD,
    INK,
    INK_MUTED,
    PHOTO_INNER,
    PRIMARY,
    PRIMARY_ACTIVE,
    SOLO_PHOTO_H,
    SOLO_PHOTO_R,
} from './card-layout'
import {
    drawCharWindow,
    drawPetWindow,
    drawStamp,
    drawTape,
    paintPaper,
} from './card-parts'

interface ComposeCardInput {
    type: TypeCode
    typeName: string
    copy: string
    /** User-uploaded parrot photo. null means a single character card (solo). */
    photo: HTMLImageElement | null
    /** MBTI character PNG (same-origin). */
    character: HTMLImageElement | null
    /** Type identity 2-color — character photo-window gradient. */
    colors: readonly [string, string]
}

export async function composeCard(input: ComposeCardInput): Promise<Blob> {
    await loadFonts()

    const canvas = document.createElement('canvas')
    canvas.width = CARD_SIZE
    canvas.height = CARD_SIZE
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
        throw new Error('Canvas 2D context unavailable')
    }

    // 1) Paper base (warm radial spreading from near the top).
    paintPaper(ctx)

    // 2) Layout — measure the tagline line count first to fix the card height.
    const hasPhoto = input.photo !== null
    const photoH = hasPhoto ? DUO_PHOTO_H : SOLO_PHOTO_H
    ctx.font = `${CAP_TAG_SIZE}px ${FONT_BODY}`
    const taglineLines = wrapLines(ctx, input.copy, CARD_W - CARD_PAD * 2 - 24, 2)
    const captionH =
        CAP_TOP_PAD +
        CAP_CODE_SIZE +
        12 +
        CAP_NAME_SIZE +
        22 +
        taglineLines.length * CAP_TAG_LINE +
        CAP_BOTTOM_PAD
    const cardH = CARD_PAD + photoH + captionH
    const cardY = Math.round((CARD_SIZE - cardH) / 2)
    const cardCx = CARD_X + CARD_W / 2
    const cardCy = cardY + cardH / 2

    // 3) Card group — rotated -2.5deg about its center.
    ctx.save()
    ctx.translate(cardCx, cardCy)
    ctx.rotate(CARD_ROTATE)
    ctx.translate(-cardCx, -cardCy)

    // Card base (with shadow).
    ctx.save()
    ctx.shadowColor = 'rgba(40,20,8,0.45)'
    ctx.shadowBlur = 60
    ctx.shadowOffsetY = 34
    ctx.fillStyle = CARD_BG
    roundRectPath(ctx, CARD_X, cardY, CARD_W, cardH, CARD_RADIUS)
    ctx.fill()
    ctx.restore()

    const photoX = CARD_X + CARD_PAD
    const photoY = cardY + CARD_PAD

    if (hasPhoto && input.photo !== null) {
        const shotW = (PHOTO_INNER - DUO_GAP) / 2
        // My parrot — cover.
        drawPetWindow(ctx, input.photo, photoX, photoY, shotW, DUO_PHOTO_H, DUO_PHOTO_R)
        // MBTI character.
        const rx = photoX + shotW + DUO_GAP
        drawCharWindow(
            ctx,
            input.character,
            input.colors,
            rx,
            photoY,
            shotW,
            DUO_PHOTO_H,
            DUO_PHOTO_R,
        )
    } else {
        drawCharWindow(
            ctx,
            input.character,
            input.colors,
            photoX,
            photoY,
            PHOTO_INNER,
            SOLO_PHOTO_H,
            SOLO_PHOTO_R,
        )
    }

    // Washi tape — straddling the card's top corners (orange left / gold right).
    drawTape(ctx, CARD_X + 110, cardY - 18, 230, 50, (-7 * Math.PI) / 180, PRIMARY)
    drawTape(ctx, CARD_X + CARD_W - 110 - 200, cardY - 14, 200, 50, (6 * Math.PI) / 180, GOLD)

    // Round brand stamp (top-right, 9deg).
    drawStamp(ctx, CARD_X + CARD_W - 22 - 65, cardY + 50 + 65, 65)

    // Caption — code / name / tagline.
    const cx = CARD_X + CARD_W / 2
    let baseline = photoY + photoH + CAP_TOP_PAD + CAP_CODE_SIZE
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    ctx.fillStyle = PRIMARY_ACTIVE
    ctx.font = `${CAP_CODE_SIZE}px ${FONT_DISPLAY}`
    ctx.fillText(input.type, cx, baseline)

    baseline += 12 + CAP_NAME_SIZE
    ctx.fillStyle = INK
    ctx.font = `${CAP_NAME_SIZE}px ${FONT_DISPLAY}`
    ctx.fillText(input.typeName, cx, baseline)

    baseline += 22 + CAP_TAG_SIZE
    ctx.fillStyle = INK_MUTED
    ctx.font = `${CAP_TAG_SIZE}px ${FONT_BODY}`
    taglineLines.forEach((line, index) => {
        ctx.fillText(line, cx, baseline + index * CAP_TAG_LINE)
    })

    ctx.restore()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (blob === null) {
        throw new Error('Canvas toBlob returned null')
    }
    return blob
}
