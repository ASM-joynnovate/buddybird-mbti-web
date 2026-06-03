// Loads and decodes an image for Canvas compositing. Rejects if the source fails
// (e.g. a 404 on an author asset that hasn't landed yet), so callers can `.catch`
// to a null and let composeCard fall back to a placeholder.

export async function loadImage(src: string): Promise<HTMLImageElement> {
    const image = new Image()
    image.decoding = 'async'
    image.src = src
    await image.decode()
    return image
}
