/** Font string helper: font('Cinzel', 64, 700) */
export function font(family, size, weight = 400, style = 'normal') {
  return `${style} ${weight} ${size}px "${family}", serif`
}

/** Shrink the font size until the text fits within maxWidth. Returns the size used. */
export function fitText(ctx, text, family, size, maxWidth, weight = 400, style = 'normal', minSize = 18) {
  let s = size
  ctx.font = font(family, s, weight, style)
  while (s > minSize && ctx.measureText(text).width > maxWidth) {
    s -= 2
    ctx.font = font(family, s, weight, style)
  }
  return s
}

export function wrapLines(ctx, text, maxWidth) {
  const out = []
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean)
    let line = ''
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line)
        line = w
      } else line = test
    }
    out.push(line)
  }
  return out
}

/**
 * Draw centred text with optional fitting, shadow and letter-by-letter reveal.
 * opts: { family, size, weight, style, color, maxWidth, alpha, shadow, reveal (0..1), spacing, stroke }
 */
export function drawText(ctx, text, x, y, opts) {
  if (!text) return
  const { family, size, weight = 400, style = 'normal', color = '#fff', maxWidth = 960, alpha = 1, shadow, reveal = 1, spacing = 0, align = 'center', stroke } = opts
  ctx.save()
  ctx.globalAlpha *= alpha
  fitText(ctx, text, family, size, maxWidth, weight, style)
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`
  if (shadow) {
    ctx.shadowColor = shadow.color
    ctx.shadowBlur = shadow.blur
    ctx.shadowOffsetY = shadow.y || 0
  }
  ctx.fillStyle = color
  let shown = text
  if (reveal < 1) {
    const n = Math.floor(text.length * reveal)
    // keep layout stable: measure full text, draw partial from the same left edge
    const full = ctx.measureText(text).width
    shown = text.slice(0, n)
    ctx.textAlign = 'left'
    const startX = align === 'center' ? x - full / 2 : x
    if (stroke) {
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.strokeText(shown, startX, y)
    }
    ctx.fillText(shown, startX, y)
    ctx.restore()
    return
  }
  if (stroke) {
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.strokeText(shown, x, y)
  }
  ctx.fillText(shown, x, y)
  ctx.restore()
}

/** Multi-line centred paragraph; returns the y after the last line. */
export function drawParagraph(ctx, text, x, y, opts) {
  const { family, size, weight = 400, style = 'normal', color, maxWidth = 900, lineHeight = 1.35, alpha = 1 } = opts
  ctx.save()
  ctx.font = `${style} ${weight} ${size}px "${family}", serif`
  const lines = wrapLines(ctx, text, maxWidth)
  ctx.restore()
  let yy = y
  for (const line of lines) {
    drawText(ctx, line, x, yy, { family, size, weight, style, color, maxWidth, alpha })
    yy += size * lineHeight
  }
  return yy
}
