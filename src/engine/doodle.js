import { clamp, rnd } from './anim.js'

const TAU = Math.PI * 2

/** Lines re-jitter a few times a second ("line boil"), like hand-drawn animation. */
const boil = (t) => Math.floor(t * 8)

/**
 * Stroke a parametric curve fn(u) -> [x, y], u in [0, 1], drawn on up to progress p,
 * with hand-drawn wobble.
 */
export function wobblyCurve(ctx, fn, { p = 1, t = 0, seed = 0, amp = 2.5, steps = 80, color = '#2b2b2b', width = 4, fill = null } = {}) {
  if (p <= 0) return
  const f = boil(t)
  const pp = clamp(p)
  const n = Math.max(1, Math.ceil(steps * pp))
  ctx.save()
  ctx.beginPath()
  for (let i = 0; i <= n; i++) {
    const [x, y] = fn(Math.min(i / steps, pp))
    const jx = (rnd(i + seed * 31, f) - 0.5) * amp
    const jy = (rnd(i + seed * 31, f + 7) - 0.5) * amp
    if (i === 0) ctx.moveTo(x + jx, y + jy)
    else ctx.lineTo(x + jx, y + jy)
  }
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.restore()
}

/** Scribbled loop around a point: slightly more than one turn, like circling a date in pen. */
export function doodleCircle(ctx, cx, cy, rx, ry, opts = {}) {
  wobblyCurve(ctx, (u) => {
    const a = -Math.PI / 2 + u * TAU * 1.15
    const grow = 1 + u * 0.08
    return [cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow]
  }, opts)
}

/** Classic parametric heart, scribbled. s ~ half-width in px. */
export function doodleHeart(ctx, cx, cy, s, opts = {}) {
  wobblyCurve(ctx, (u) => {
    const a = u * TAU * (opts.loops || 1)
    const x = 16 * Math.sin(a) ** 3
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)
    return [cx + (x / 16) * s, cy - (y / 16) * s]
  }, { steps: 90, ...opts })
}

export function doodleStar(ctx, cx, cy, r, opts = {}) {
  wobblyCurve(ctx, (u) => {
    const k = u * 10
    const i = Math.floor(k)
    const f = k - i
    const pt = (j) => {
      const a = -Math.PI / 2 + (j * TAU) / 10
      const rr = j % 2 ? r * 0.45 : r
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]
    }
    const [x0, y0] = pt(i)
    const [x1, y1] = pt(i + 1)
    return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]
  }, { steps: 40, ...opts })
}

/** Curvy arrow from (x0, y0) to (x1, y1) bending by `bend`. */
export function doodleArrow(ctx, x0, y0, x1, y1, bend, opts = {}) {
  const mx = (x0 + x1) / 2 + bend
  const my = (y0 + y1) / 2 - bend * 0.4
  const at = (u) => [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * my + u * u * y1]
  wobblyCurve(ctx, at, { steps: 40, ...opts })
  if ((opts.p ?? 1) >= 1) {
    const [ax, ay] = at(0.92)
    const ang = Math.atan2(y1 - ay, x1 - ax)
    for (const s of [-1, 1]) {
      const a = ang + Math.PI - s * 0.5
      wobblyCurve(ctx, (u) => [x1 + Math.cos(a) * 34 * u, y1 + Math.sin(a) * 34 * u], { ...opts, steps: 6, seed: (opts.seed || 0) + s * 5, p: 1 })
    }
  }
}

/** Wavy underline. */
export function squiggle(ctx, x, y, w, opts = {}) {
  wobblyCurve(ctx, (u) => [x + u * w, y + Math.sin(u * Math.PI * 6) * 8], { steps: 60, ...opts })
}

/** Strip of semi-transparent washi tape. */
export function washiTape(ctx, x, y, w, h, angle, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.globalAlpha *= 0.85
  ctx.beginPath()
  ctx.moveTo(-w / 2, -h / 2)
  for (let i = 0; i <= 6; i++) ctx.lineTo(-w / 2 + (i * w) / 6, -h / 2 + (i % 2 ? 3 : 0))
  ctx.lineTo(w / 2, h / 2)
  for (let i = 6; i >= 0; i--) ctx.lineTo(-w / 2 + (i * w) / 6, h / 2 - (i % 2 ? 3 : 0))
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,.55)'
  ctx.lineWidth = 3
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(i * w * 0.18 - 10, -h / 2)
    ctx.lineTo(i * w * 0.18 + 10, h / 2)
    ctx.stroke()
  }
  ctx.restore()
}
