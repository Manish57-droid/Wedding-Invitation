// Shared drawing kit for the fun / groovy / Gen-Z templates.
import { rgba, shade } from '../../lib/color.js'
import { clamp, ease, prog, rnd } from '../anim.js'
import { roundRect } from '../scenes.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'

const TAU = Math.PI * 2
export const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'

export const CARD = { x: 90, y: 240, w: W - 180, r: 48 }

/** Rounded "stage" card behind the couple. */
export function stageCard(ctx, local, archBottom, { fill, stroke, lineWidth = 6, glow = null, r = CARD.r, top = CARD.y }) {
  const p = ease.outBack(prog(local, 0, 0.7))
  if (p <= 0) return
  ctx.save()
  ctx.translate(W / 2, archBottom)
  ctx.scale(p, p)
  ctx.translate(-W / 2, -archBottom)
  roundRect(ctx, CARD.x, top, CARD.w, archBottom - top + 2, r)
  if (typeof fill === 'function') fill(ctx, top, archBottom)
  else {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    if (glow) {
      ctx.shadowColor = glow
      ctx.shadowBlur = 30
    }
    roundRect(ctx, CARD.x, top, CARD.w, archBottom - top + 2, r)
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
  ctx.restore()
}

/** Clip avatars to the stage card (open at the bottom edge). */
export function clipCard(ctx, archBottom, { r = CARD.r, top = CARD.y } = {}) {
  roundRect(ctx, CARD.x + 4, top + 4, CARD.w - 8, archBottom - top - 2, r - 4)
  ctx.clip()
}

export function band(ctx, y, h, color, accent) {
  ctx.fillStyle = color
  ctx.fillRect(CARD.x - 20, y - 4, CARD.w + 40, h)
  if (accent) {
    ctx.fillStyle = accent
    ctx.fillRect(CARD.x - 20, y - 6, CARD.w + 40, 8)
  }
}

export function closingBand(ctx, y, color, accent) {
  ctx.fillStyle = color
  ctx.fillRect(W / 2 - 320, y, 640, 56)
  if (accent) {
    ctx.fillStyle = accent
    ctx.fillRect(W / 2 - 320, y, 640, 7)
  }
}

/** Emoji drifting upwards (reactions, sparkles). */
export function emojiFloat(ctx, t, emojis, { count = 14, seed = 3, size = 54, alpha = 0.9, speed = 70 } = {}) {
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < count; i++) {
    const sp = speed * (0.6 + rnd(i, seed) * 0.8)
    const y = H + 80 - ((rnd(i, seed + 1) * (H + 160) + t * sp) % (H + 160))
    const x = rnd(i, seed + 2) * W + Math.sin(t * 1.3 + i) * 30
    const s = size * (0.6 + rnd(i, seed + 3) * 0.7)
    ctx.font = `${Math.round(s)}px ${EMOJI_FONT}`
    ctx.fillText(emojis[i % emojis.length], x, y)
  }
  ctx.restore()
}

export function emoji(ctx, e, x, y, size, alpha = 1) {
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.font = `${Math.round(size)}px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(e, x, y)
  ctx.restore()
}

/** Comic-style spiky burst. */
export function starburst(ctx, x, y, r, { points = 14, fill = '#ffd60a', stroke = '#111', rot = 0, inner = 0.68, lineWidth = 8 } = {}) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * TAU
    const rr = i % 2 ? r * inner : r * (0.92 + rnd(i, 4) * 0.16)
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
  }
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineJoin = 'round'
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.stroke()
  ctx.restore()
}

export function halftone(ctx, color, { spacing = 30, maxR = 7, cx = W, cy = 0 } = {}) {
  ctx.fillStyle = color
  const maxD = Math.hypot(W, H)
  for (let y = 0; y < H + spacing; y += spacing) {
    for (let x = (y / spacing) % 2 ? spacing / 2 : 0; x < W + spacing; x += spacing) {
      const r = maxR * (1 - Math.hypot(x - cx, y - cy) / maxD)
      if (r < 0.6) continue
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.fill()
    }
  }
}

/** Synthwave floor grid scrolling towards the viewer. */
export function perspectiveGrid(ctx, horizon, color, t, { lineWidth = 2.5, glow = true } = {}) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  if (glow) {
    ctx.shadowColor = color
    ctx.shadowBlur = 12
  }
  for (let i = -14; i <= 14; i++) {
    ctx.beginPath()
    ctx.moveTo(W / 2 + i * 18, horizon)
    ctx.lineTo(W / 2 + i * 260, H)
    ctx.stroke()
  }
  const phase = (t * 0.6) % 1
  for (let k = 0; k < 14; k++) {
    const z = (k + phase) / 14
    const y = horizon + (H - horizon) * z * z
    ctx.globalAlpha = clamp(z * 1.6)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  ctx.restore()
}

/** Glowing neon text (draws the glow twice for a richer tube look). */
export function neon(ctx, text, x, y, { family, size, color, flicker = 1, maxWidth = 940, style = 'normal', weight = 400 }) {
  const opts = { family, size, color: '#fff', maxWidth, style, weight, alpha: flicker, shadow: { color, blur: 36 } }
  drawText(ctx, text, x, y, { ...opts, color, stroke: { color, width: 6 } })
  drawText(ctx, text, x, y, opts)
}

/** Neon tubes occasionally flicker; deterministic per time. */
export function flicker(t, seed = 0) {
  const k = Math.floor(t * 12)
  return rnd(k, seed) > 0.96 ? 0.35 : 1
}

/** Diagonal caution tape across the frame. */
export function cautionTape(ctx, y, angle, text, t, { family = 'Bebas Neue', speed = 120 } = {}) {
  ctx.save()
  ctx.translate(W / 2, y)
  ctx.rotate(angle)
  const len = W * 1.6
  ctx.fillStyle = '#ffd60a'
  ctx.fillRect(-len / 2, -46, len, 92)
  ctx.save()
  ctx.beginPath()
  ctx.rect(-len / 2, -46, len, 92)
  ctx.clip()
  ctx.fillStyle = '#111'
  const off = (t * speed) % 80
  for (let x = -len / 2 - 80; x < len / 2 + 80; x += 80) {
    for (const yy of [-46, 34]) {
      ctx.beginPath()
      ctx.moveTo(x + off, yy)
      ctx.lineTo(x + off + 34, yy)
      ctx.lineTo(x + off + 46, yy + 12)
      ctx.lineTo(x + off + 12, yy + 12)
      ctx.fill()
    }
  }
  ctx.font = `400 48px "${family}", sans-serif`
  ctx.textBaseline = 'middle'
  const unit = `${text}   `
  const uw = ctx.measureText(unit).width || 1
  const toff = (t * speed) % uw
  for (let x = -len / 2 - uw + toff; x < len / 2; x += uw) ctx.fillText(unit, x, 4)
  ctx.restore()
  ctx.restore()
}

/** Chat bubble; side -1 = left (grey), 1 = right (coloured). Returns its height. */
export function chatBubble(ctx, text, side, y, p, { family = 'Fredoka', size = 44, left = '#ffffff', right = '#7b5cff', leftText = '#222', rightText = '#fff', maxW = 700 } = {}) {
  if (p <= 0) return 0
  ctx.save()
  ctx.font = `500 ${size}px "${family}", sans-serif`
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW - 60 && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  lines.push(line)
  const w = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 64)
  const h = lines.length * size * 1.25 + 40
  const x = side < 0 ? 90 : W - 90 - w
  const s = ease.outBack(clamp(p))
  ctx.translate(side < 0 ? x : x + w, y + h)
  ctx.scale(s, s)
  ctx.translate(side < 0 ? -x : -(x + w), -(y + h))
  ctx.globalAlpha *= clamp(p * 2)
  roundRect(ctx, x, y, w, h, 34)
  ctx.fillStyle = side < 0 ? left : right
  ctx.shadowColor = 'rgba(0,0,0,.12)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 4
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = side < 0 ? leftText : rightText
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  lines.forEach((l, i) => ctx.fillText(l, x + 32, y + 20 + size * 0.62 + i * size * 1.25))
  ctx.restore()
  return h
}

export function typingDots(ctx, x, y, t, color = '#999') {
  ctx.save()
  roundRect(ctx, x, y, 150, 80, 34)
  ctx.fillStyle = '#fff'
  ctx.fill()
  for (let i = 0; i < 3; i++) {
    const b = Math.max(0, Math.sin(t * 8 - i * 0.9))
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x + 42 + i * 33, y + 42 - b * 8, 10, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

export function pixelHeart(ctx, x, y, s, color) {
  const map = ['01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000']
  ctx.fillStyle = color
  map.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) if (row[i] === '1') ctx.fillRect(x + (i - 4) * s, y + (j - 3.5) * s, s, s)
  })
}

export function cloud(ctx, x, y, s, color = '#fff') {
  ctx.fillStyle = color
  for (const [dx, dy, r] of [[0, 0, 1], [0.9, -0.3, 0.8], [1.7, 0.05, 0.7], [-0.85, 0.1, 0.7]]) {
    ctx.beginPath()
    ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU)
    ctx.fill()
  }
  ctx.fillRect(x - 0.85 * s, y, 2.55 * s, 0.75 * s)
}

export function daisy(ctx, x, y, r, rot, petal = '#fff', center = '#f2b134') {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.fillStyle = petal
  for (let i = 0; i < 8; i++) {
    ctx.rotate(TAU / 8)
    ctx.beginPath()
    ctx.ellipse(0, -r * 0.62, r * 0.28, r * 0.5, 0, 0, TAU)
    ctx.fill()
  }
  ctx.fillStyle = center
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.32, 0, TAU)
  ctx.fill()
  ctx.restore()
}

export function scanlines(ctx, alpha = 0.12) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2)
}

/** Generic headline-style opening used by several fun templates. */
export function headlineOpening({ kicker, before } = {}) {
  return function opening(ctx, local, dur, env) {
    const { theme, t } = env
    const F = theme.fonts
    const P = theme.palette
    const T = theme.texts
    const a = Math.min(clamp(local / 0.4), clamp((dur - local) / 0.6))
    ctx.save()
    ctx.globalAlpha *= a
    before?.(ctx, local, env)
    if (kicker) kicker(ctx, local, env)
    const mp = ease.outElastic(prog(local, 0.5, 1.2))
    if (mp > 0) {
      ctx.save()
      ctx.translate(W / 2, 880)
      ctx.rotate(-0.05)
      ctx.scale(mp, mp)
      drawText(ctx, T.main, 0, 0, { family: F.title, size: 150, color: P.heading, maxWidth: 920, shadow: theme.glow, stroke: theme.titleStroke })
      ctx.restore()
    }
    if (T.deva) drawText(ctx, T.deva, W / 2, 1060, { family: F.deva, size: 96, color: P.accent, alpha: prog(local, 1.2, 0.5) })
    drawText(ctx, T.sub, W / 2, 1180, { family: F.body, size: 54, weight: 600, color: P.text, maxWidth: 900, reveal: prog(local, 1.5, 1) })
    void t
    ctx.restore()
  }
}

export { rgba, shade, TAU }
