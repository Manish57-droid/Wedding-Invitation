import { marigold } from './ornaments.js'

const ASPECT = 400 / 600

/** Avatars blink briefly every few seconds, offset per person so they never blink together. */
function isBlinking(t, offset) {
  const period = 3.7
  const x = (t + offset) % period
  return x > period - 0.14
}

/**
 * Draw an avatar with its bottom-centre at (x, y) and height h.
 * opts: { t, who: 'groom'|'bride', alpha, tilt, bob }
 */
export function drawAvatar(ctx, assets, who, x, y, h, { t = 0, alpha = 1, tilt = 0, bob = 1, flip = false } = {}) {
  const a = assets.avatars?.[who]
  if (!a) return
  const img = isBlinking(t, who === 'groom' ? 0 : 1.6) ? a.blink : a.open
  const w = h * ASPECT
  const by = Math.sin(t * 2.1 + (who === 'groom' ? 0 : 1.3)) * 6 * bob
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.translate(x, y + by)
  ctx.rotate(tilt + Math.sin(t * 1.3 + (who === 'groom' ? 0 : 2)) * 0.012 * bob)
  if (flip) ctx.scale(-1, 1)
  ctx.drawImage(img, -w / 2, -h, w, h)
  ctx.restore()
}

/** Map an avatar-space point (400x600 coordinates) to canvas space. */
export function avatarPoint(x, y, h, ax, ay) {
  const s = h / 600
  return [x - 200 * s + ax * s, y - h + ay * s]
}

/** Circular head-and-shoulders medallion of an avatar. */
export function drawAvatarMedallion(ctx, assets, who, cx, cy, r, { t = 0, ring = '#d4a64a', bg = '#fff4e0', alpha = 1 } = {}) {
  const a = assets.avatars?.[who]
  if (!a) return
  const img = isBlinking(t, who === 'groom' ? 0.4 : 2) ? a.blink : a.open
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.save()
  ctx.clip()
  // head occupies roughly avatar-space (60..340, 20..380)
  const scale = (r * 2) / 330
  const w = 400 * scale
  const h = 600 * scale
  ctx.drawImage(img, cx - w / 2, cy - r - 30 * scale, w, h)
  ctx.restore()
  ctx.lineWidth = Math.max(4, r * 0.06)
  ctx.strokeStyle = ring
  ctx.stroke()
  ctx.restore()
}

/** Marigold varmala (wedding garland) hanging around the avatar's neck; drop 0..1 animates it in. */
export function drawVarmala(ctx, x, y, h, drop, { t = 0, colors = ['#f59b1a', '#ffc425', '#e8364f'] } = {}) {
  if (drop <= 0) return
  const s = h / 600
  const fall = (1 - drop) * -h * 0.9
  const [lx, ly] = avatarPoint(x, y + fall, h, 128, 344)
  const [rx, ry] = avatarPoint(x, y + fall, h, 272, 344)
  const sag = 210 * s
  const n = 22
  const bob = Math.sin(t * 2.1) * 6
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const px = lx + (rx - lx) * f
    const py = ly + (ry - ly) * f + Math.sin(f * Math.PI) * sag + bob
    marigold(ctx, px, py, 15 * s * 1.6, colors[i % colors.length])
  }
}
