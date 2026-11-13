// Colour emoji glyphs are slow to rasterise, and video pages draw dozens per frame.
// Draw each emoji once per size bucket onto a small canvas and reuse it.

export const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'

const cache = new Map()
const MAX_ENTRIES = 300

function sprite(e, size) {
  const bucket = Math.max(8, Math.ceil(size / 8) * 8)
  const key = `${bucket}|${e}`
  let c = cache.get(key)
  if (!c) {
    const pad = Math.ceil(bucket * 0.35)
    c = document.createElement('canvas')
    c.width = c.height = bucket + pad * 2
    const g = c.getContext('2d')
    g.font = `${bucket}px ${EMOJI_FONT}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillStyle = '#000'
    g.fillText(e, c.width / 2, c.height / 2)
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value)
    cache.set(key, c)
  }
  return { c, scale: size / bucket }
}

/** Draw an emoji centred at (x, y) at the given font size. */
export function drawEmoji(ctx, e, x, y, size, alpha = 1) {
  if (!e || size < 2) return
  const { c, scale } = sprite(e, size)
  const w = c.width * scale
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.drawImage(c, x - w / 2, y - w / 2, w, w)
  ctx.restore()
}
