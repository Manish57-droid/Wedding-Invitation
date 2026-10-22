import { rgba, shade } from '../lib/color.js'
import { clamp, ease, rnd } from './anim.js'

const TAU = Math.PI * 2

export function marigold(ctx, x, y, r, color = '#f59b1a') {
  const dark = shade(color, -0.18)
  ctx.fillStyle = dark
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
  ctx.fillStyle = color
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU
    ctx.beginPath()
    ctx.arc(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, r * 0.55, 0, TAU)
    ctx.fill()
  }
  ctx.fillStyle = shade(color, 0.25)
  ctx.beginPath()
  ctx.arc(x, y, r * 0.38, 0, TAU)
  ctx.fill()
}

export function leaf(ctx, x, y, len, angle, color = '#2f7a3a') {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(len * 0.5, -len * 0.32, len, 0)
  ctx.quadraticCurveTo(len * 0.5, len * 0.32, 0, 0)
  ctx.fill()
  ctx.strokeStyle = shade(color, 0.25)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(len * 0.9, 0)
  ctx.stroke()
  ctx.restore()
}

/** A vertical string of marigolds hanging from (x, top), swaying with time. */
export function garlandString(ctx, x, top, length, t, { r = 22, colors = ['#f59b1a', '#ffc425'], seed = 0, sway = 1, tassel = true } = {}) {
  const n = Math.floor(length / (r * 1.55))
  const phase = rnd(seed, 3) * TAU
  ctx.strokeStyle = 'rgba(80,40,10,.5)'
  ctx.lineWidth = 2
  let px = x
  let py = top
  ctx.beginPath()
  ctx.moveTo(x, top)
  const pts = []
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const off = Math.sin(t * 1.4 + phase + f * 1.2) * 14 * f * f * sway
    px = x + off
    py = top + f * length
    pts.push([px, py])
    ctx.lineTo(px, py)
  }
  ctx.stroke()
  pts.forEach(([gx, gy], i) => {
    if (i === 0) return
    marigold(ctx, gx, gy, r * (i % 5 === 0 ? 0.8 : 1), colors[i % colors.length])
  })
  if (tassel) {
    const [tx, ty] = pts[pts.length - 1]
    leaf(ctx, tx, ty + r * 0.6, r * 1.6, Math.PI / 2 + 0.5, '#2f7a3a')
    leaf(ctx, tx, ty + r * 0.6, r * 1.6, Math.PI / 2 - 0.5, '#3a8f45')
    ctx.fillStyle = '#c21d3a'
    ctx.beginPath()
    ctx.arc(tx, ty + r * 1.1, r * 0.45, 0, TAU)
    ctx.fill()
  }
}

/** Draped swag of flowers between two points (catenary-ish curve). */
export function swag(ctx, x0, x1, y, sag, t, { r = 16, colors = ['#f59b1a', '#ffc425'], seed = 0 } = {}) {
  const n = Math.max(6, Math.floor(Math.abs(x1 - x0) / (r * 1.5)))
  const wob = Math.sin(t * 1.2 + seed) * 6
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const x = x0 + (x1 - x0) * f
    const yy = y + Math.sin(f * Math.PI) * (sag + wob)
    marigold(ctx, x, yy, r, colors[(i + seed) % colors.length])
  }
}

/** Mango-leaf toran with marigold swags and small bells across the top. */
export function toran(ctx, W, y, t, { colors = ['#f59b1a', '#ffc425'], leafColor = '#2f7a3a', bells = true, bellColor = '#d4a64a' } = {}) {
  const segs = 5
  const segW = W / segs
  for (let s = 0; s < segs; s++) {
    const x0 = s * segW
    for (let k = 0; k < 4; k++) {
      const lx = x0 + segW * (0.2 + k * 0.2)
      const ang = Math.PI / 2 + Math.sin(t * 1.8 + s + k) * 0.08
      leaf(ctx, lx, y + 6, 70, ang, k % 2 ? leafColor : shade(leafColor, 0.15))
    }
  }
  for (let s = 0; s < segs; s++) swag(ctx, s * segW, (s + 1) * segW, y, 46, t, { r: 15, colors, seed: s })
  if (bells) {
    for (let s = 1; s < segs; s++) {
      const bx = s * segW
      const swing = Math.sin(t * 2.4 + s) * 0.15
      bell(ctx, bx, y, 70, swing, bellColor)
    }
  }
}

export function bell(ctx, x, y, len, swing, color = '#d4a64a') {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(swing)
  ctx.strokeStyle = shade(color, -0.3)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, len)
  ctx.stroke()
  const g = ctx.createLinearGradient(-18, 0, 18, 0)
  g.addColorStop(0, shade(color, -0.25))
  g.addColorStop(0.5, shade(color, 0.3))
  g.addColorStop(1, shade(color, -0.25))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(-6, len)
  ctx.quadraticCurveTo(-8, len + 14, -20, len + 32)
  ctx.lineTo(20, len + 32)
  ctx.quadraticCurveTo(8, len + 14, 6, len)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = shade(color, -0.35)
  ctx.beginPath()
  ctx.arc(0, len + 35, 5, 0, TAU)
  ctx.fill()
  ctx.restore()
}

export function diya(ctx, x, y, s, t, seed = 0) {
  const flick = 1 + Math.sin(t * 13 + seed * 7) * 0.06 + Math.sin(t * 23 + seed) * 0.04
  // glow
  const glow = ctx.createRadialGradient(x, y - s * 0.9, 0, x, y - s * 0.9, s * 2.6)
  glow.addColorStop(0, 'rgba(255,200,90,.55)')
  glow.addColorStop(1, 'rgba(255,160,40,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y - s * 0.9, s * 2.6, 0, TAU)
  ctx.fill()
  // bowl
  const bowl = ctx.createLinearGradient(x, y - s * 0.3, x, y + s * 0.5)
  bowl.addColorStop(0, '#c4622d')
  bowl.addColorStop(1, '#7a3214')
  ctx.fillStyle = bowl
  ctx.beginPath()
  ctx.moveTo(x - s, y - s * 0.25)
  ctx.quadraticCurveTo(x, y + s * 0.75, x + s, y - s * 0.25)
  ctx.quadraticCurveTo(x + s * 0.7, y - s * 0.05, x + s * 1.15, y - s * 0.45)
  ctx.quadraticCurveTo(x, y - s * 0.05, x - s, y - s * 0.25)
  ctx.fill()
  ctx.strokeStyle = '#f0c060'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - s * 0.8, y)
  ctx.quadraticCurveTo(x, y + s * 0.35, x + s * 0.8, y)
  ctx.stroke()
  // flame
  const fh = s * 0.95 * flick
  const fx = x + Math.sin(t * 9 + seed) * s * 0.05
  const fy = y - s * 0.3
  const fg = ctx.createLinearGradient(fx, fy - fh, fx, fy)
  fg.addColorStop(0, '#fff3b0')
  fg.addColorStop(0.5, '#ffb52e')
  fg.addColorStop(1, '#ff6a00')
  ctx.fillStyle = fg
  ctx.beginPath()
  ctx.moveTo(fx, fy - fh)
  ctx.quadraticCurveTo(fx + s * 0.32, fy - fh * 0.35, fx, fy)
  ctx.quadraticCurveTo(fx - s * 0.32, fy - fh * 0.35, fx, fy - fh)
  ctx.fill()
}

export function skyLantern(ctx, x, y, s, t, seed = 0) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4)
  glow.addColorStop(0, 'rgba(255,170,60,.45)')
  glow.addColorStop(1, 'rgba(255,120,30,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, s * 2.4, 0, TAU)
  ctx.fill()
  const flick = 0.85 + Math.sin(t * 6 + seed * 5) * 0.08
  const g = ctx.createLinearGradient(x, y - s, x, y + s)
  g.addColorStop(0, `rgba(255,${Math.round(150 * flick)},60,0.95)`)
  g.addColorStop(1, 'rgba(255,230,140,0.98)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(x - s * 0.62, y - s)
  ctx.lineTo(x + s * 0.62, y - s)
  ctx.quadraticCurveTo(x + s * 0.8, y, x + s * 0.48, y + s)
  ctx.lineTo(x - s * 0.48, y + s)
  ctx.quadraticCurveTo(x - s * 0.8, y, x - s * 0.62, y - s)
  ctx.fill()
}

/** Line-art mandala; `p` (0..1) draws it progressively. */
export function mandala(ctx, x, y, r, color, rot = 0, p = 1, lineWidth = 2) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  const rings = [
    { n: 16, rr: r, petal: r * 0.22 },
    { n: 12, rr: r * 0.72, petal: r * 0.2 },
    { n: 8, rr: r * 0.45, petal: r * 0.2 },
  ]
  rings.forEach((ring, ri) => {
    const rp = clamp(p * 3 - ri)
    if (rp <= 0) return
    const count = Math.ceil(ring.n * rp)
    for (let i = 0; i < count; i++) {
      const a = (i / ring.n) * TAU
      ctx.save()
      ctx.rotate(a)
      ctx.beginPath()
      ctx.moveTo(0, -ring.rr + ring.petal)
      ctx.quadraticCurveTo(ring.petal * 0.6, -ring.rr + ring.petal * 0.3, 0, -ring.rr - ring.petal * 0.2)
      ctx.quadraticCurveTo(-ring.petal * 0.6, -ring.rr + ring.petal * 0.3, 0, -ring.rr + ring.petal)
      ctx.stroke()
      ctx.restore()
    }
    ctx.beginPath()
    ctx.arc(0, 0, ring.rr - ring.petal * 1.1, 0, TAU * rp)
    ctx.stroke()
  })
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.12, 0, TAU * p)
  ctx.stroke()
  ctx.restore()
}

/** Kalash (sacred pot) emblem for the invocation scene. */
export function kalash(ctx, x, y, s, gold = '#d4a64a', t = 0) {
  ctx.save()
  ctx.translate(x, y)
  const g = ctx.createLinearGradient(-s, 0, s, 0)
  g.addColorStop(0, shade(gold, -0.3))
  g.addColorStop(0.45, shade(gold, 0.35))
  g.addColorStop(1, shade(gold, -0.3))
  // mango leaves
  for (let i = -2; i <= 2; i++) leaf(ctx, 0, -s * 0.55, s * 0.75, -Math.PI / 2 + i * 0.42 + Math.sin(t * 1.5) * 0.03, i % 2 ? '#2f7a3a' : '#3a8f45')
  // coconut
  ctx.fillStyle = '#8a5a2b'
  ctx.beginPath()
  ctx.ellipse(0, -s * 0.78, s * 0.3, s * 0.38, 0, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = '#5c3a18'
  ctx.lineWidth = 2
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(i * s * 0.08, -s * 1.12)
    ctx.quadraticCurveTo(i * s * 0.16, -s * 0.78, i * s * 0.08, -s * 0.44)
    ctx.stroke()
  }
  // pot
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(-s * 0.4, -s * 0.5)
  ctx.lineTo(s * 0.4, -s * 0.5)
  ctx.quadraticCurveTo(s * 0.32, -s * 0.32, s * 0.6, -s * 0.12)
  ctx.quadraticCurveTo(s * 1.05, s * 0.25, s * 0.55, s * 0.68)
  ctx.lineTo(-s * 0.55, s * 0.68)
  ctx.quadraticCurveTo(-s * 1.05, s * 0.25, -s * 0.6, -s * 0.12)
  ctx.quadraticCurveTo(-s * 0.32, -s * 0.32, -s * 0.4, -s * 0.5)
  ctx.fill()
  ctx.fillStyle = shade(gold, -0.25)
  ctx.fillRect(-s * 0.46, -s * 0.56, s * 0.92, s * 0.1)
  ctx.fillRect(-s * 0.5, s * 0.66, s, s * 0.12)
  // swastik-free decorative band
  ctx.strokeStyle = '#b3122e'
  ctx.lineWidth = s * 0.05
  ctx.beginPath()
  ctx.moveTo(-s * 0.78, s * 0.16)
  ctx.quadraticCurveTo(0, s * 0.32, s * 0.78, s * 0.16)
  ctx.stroke()
  ctx.fillStyle = '#b3122e'
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath()
    ctx.arc(i * s * 0.28, s * 0.36 + Math.abs(i) * -s * 0.02, s * 0.05, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

/** Ornate rectangular frame with corner flourishes; p (0..1) draws it on. */
export function ornateFrame(ctx, W, H, color, p = 1, inset = 46) {
  ctx.save()
  ctx.strokeStyle = color
  const per = 2 * (W - 2 * inset + H - 2 * inset)
  ctx.lineWidth = 3
  ctx.setLineDash([per * p, per])
  ctx.strokeRect(inset, inset, W - 2 * inset, H - 2 * inset)
  const per2 = 2 * (W - 2 * inset - 36 + H - 2 * inset - 36)
  ctx.lineWidth = 1.5
  ctx.setLineDash([per2 * p, per2])
  ctx.strokeRect(inset + 18, inset + 18, W - 2 * inset - 36, H - 2 * inset - 36)
  ctx.setLineDash([])
  const cp = ease.outBack(clamp(p * 1.4 - 0.3))
  if (cp > 0) {
    for (const [cx, cy, sx, sy] of [[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]]) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(sx * cp, sy * cp)
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, 90)
      ctx.bezierCurveTo(0, 40, 40, 0, 90, 0)
      ctx.moveTo(18, 120)
      ctx.bezierCurveTo(30, 60, 60, 30, 120, 18)
      ctx.stroke()
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(34, 34, 9, 0, TAU)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(34, 34)
      ctx.quadraticCurveTo(70, 44, 84, 76)
      ctx.quadraticCurveTo(52, 70, 34, 34)
      ctx.fill()
      ctx.restore()
    }
  }
  ctx.restore()
}

/** Decorative divider: line — diamond — line */
export function divider(ctx, x, y, w, color, p = 1) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2
  const hw = (w / 2) * p
  ctx.beginPath()
  ctx.moveTo(x - 22, y)
  ctx.lineTo(x - 22 - hw, y)
  ctx.moveTo(x + 22, y)
  ctx.lineTo(x + 22 + hw, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y - 12 * p)
  ctx.lineTo(x + 12 * p, y)
  ctx.lineTo(x, y + 12 * p)
  ctx.lineTo(x - 12 * p, y)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function heart(ctx, x, y, s, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, s * 0.3)
  ctx.bezierCurveTo(-s * 0.05, s * 0.25, -s * 0.5, -s * 0.05, -s * 0.5, -s * 0.3)
  ctx.bezierCurveTo(-s * 0.5, -s * 0.58, -s * 0.12, -s * 0.62, 0, -s * 0.36)
  ctx.bezierCurveTo(s * 0.12, -s * 0.62, s * 0.5, -s * 0.58, s * 0.5, -s * 0.3)
  ctx.bezierCurveTo(s * 0.5, -s * 0.05, s * 0.05, s * 0.25, 0, s * 0.3)
  ctx.fill()
  ctx.restore()
}

/** Royal palace silhouette along the bottom edge. */
export function palace(ctx, W, baseY, color, windowColor, t = 0) {
  ctx.save()
  ctx.fillStyle = color
  const dome = (cx, w, h, top) => {
    ctx.beginPath()
    ctx.moveTo(cx - w / 2, top)
    ctx.bezierCurveTo(cx - w / 2, top - h * 0.7, cx - w * 0.1, top - h * 0.8, cx, top - h)
    ctx.bezierCurveTo(cx + w * 0.1, top - h * 0.8, cx + w / 2, top - h * 0.7, cx + w / 2, top)
    ctx.fill()
    ctx.fillRect(cx - 3, top - h - 26, 6, 26)
    ctx.beginPath()
    ctx.arc(cx, top - h - 28, 7, 0, TAU)
    ctx.fill()
  }
  // main body
  ctx.fillRect(W * 0.22, baseY - 260, W * 0.56, 260)
  dome(W * 0.5, 300, 220, baseY - 258)
  dome(W * 0.3, 120, 90, baseY - 258)
  dome(W * 0.7, 120, 90, baseY - 258)
  // minarets
  for (const mx of [W * 0.12, W * 0.88]) {
    ctx.fillRect(mx - 22, baseY - 420, 44, 420)
    dome(mx, 64, 60, baseY - 418)
    ctx.fillRect(mx - 32, baseY - 300, 64, 10)
  }
  ctx.fillRect(0, baseY - 110, W, 110)
  // lit arched windows
  for (let i = 0; i < 7; i++) {
    const wx = W * 0.27 + i * W * 0.077
    const lit = 0.65 + Math.sin(t * 2 + i * 1.7) * 0.15
    ctx.fillStyle = rgba(windowColor, lit)
    ctx.beginPath()
    ctx.moveTo(wx - 18, baseY - 120)
    ctx.lineTo(wx - 18, baseY - 180)
    ctx.quadraticCurveTo(wx, baseY - 216, wx + 18, baseY - 180)
    ctx.lineTo(wx + 18, baseY - 120)
    ctx.fill()
  }
  ctx.restore()
}

/** Firework burst at progress p (0..1). Deterministic per seed. */
export function firework(ctx, x, y, p, color, seed = 0, radius = 220) {
  if (p <= 0 || p >= 1) return
  const n = 36
  const r = radius * ease.outCubic(p)
  const fade = 1 - p
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rnd(i, seed) * 0.2
    const rr = r * (0.75 + rnd(i, seed + 1) * 0.3)
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr + p * p * 80
    ctx.strokeStyle = rgba(color, fade * 0.8)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(a) * rr * 0.75, y + Math.sin(a) * rr * 0.75 + p * p * 60)
    ctx.lineTo(px, py)
    ctx.stroke()
    ctx.fillStyle = rgba('#ffffff', fade)
    ctx.beginPath()
    ctx.arc(px, py, 3, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

/** Botanical line-art sprig that draws itself on (p 0..1). */
export function sprig(ctx, x, y, len, angle, color, p = 1, lineWidth = 2.5) {
  if (p <= 0) return
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  const stemP = clamp(p * 1.3)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  const steps = 30
  for (let i = 1; i <= steps * stemP; i++) {
    const f = i / steps
    ctx.lineTo(f * len, Math.sin(f * Math.PI) * -len * 0.12)
  }
  ctx.stroke()
  const leaves = 7
  for (let i = 1; i <= leaves; i++) {
    const f = i / (leaves + 1)
    const lp = clamp((p - f * 0.7) * 4)
    if (lp <= 0) continue
    const lx = f * len
    const ly = Math.sin(f * Math.PI) * -len * 0.12
    const side = i % 2 ? 1 : -1
    const ll = len * 0.16 * (1 - f * 0.4) * lp
    ctx.save()
    ctx.translate(lx, ly)
    ctx.rotate(side * 0.75)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(ll * 0.5, -ll * 0.35 * side, ll, 0)
    ctx.quadraticCurveTo(ll * 0.5, ll * 0.35 * side, 0, 0)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

/** Gold-trimmed arch (jharokha) used behind the couple. */
export function arch(ctx, cx, bottom, w, h, color, fill = null, lineWidth = 4) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, bottom)
  ctx.lineTo(cx - w / 2, bottom - h + w * 0.42)
  ctx.bezierCurveTo(cx - w / 2, bottom - h + w * 0.1, cx - w * 0.12, bottom - h + w * 0.06, cx, bottom - h)
  ctx.bezierCurveTo(cx + w * 0.12, bottom - h + w * 0.06, cx + w / 2, bottom - h + w * 0.1, cx + w / 2, bottom - h + w * 0.42)
  ctx.lineTo(cx + w / 2, bottom)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
  ctx.restore()
}
