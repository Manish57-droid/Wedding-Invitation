import { rgba } from '../lib/color.js'
import { rnd } from './anim.js'
import { marigold, skyLantern } from './ornaments.js'

const TAU = Math.PI * 2

// All particles are pure functions of time, so any frame can be rendered independently.

export function petals(ctx, t, W, H, { count = 26, colors = ['#e63950', '#ff8fa3'], alpha = 1, seed = 1 } = {}) {
  ctx.save()
  ctx.globalAlpha *= alpha
  for (let i = 0; i < count; i++) {
    const speed = 90 + rnd(i, seed) * 120
    const x0 = rnd(i, seed + 1) * W
    const y = ((rnd(i, seed + 2) * (H + 200) + t * speed) % (H + 200)) - 100
    const x = x0 + Math.sin(t * (0.8 + rnd(i, seed + 3)) + i) * 60
    const rot = t * (1 + rnd(i, seed + 4) * 2) + i
    const s = 14 + rnd(i, seed + 5) * 14
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.scale(1, Math.abs(Math.cos(t * 2 + i)) * 0.6 + 0.4)
    ctx.fillStyle = colors[i % colors.length]
    ctx.beginPath()
    ctx.moveTo(0, -s)
    ctx.bezierCurveTo(s * 0.8, -s * 0.6, s * 0.6, s * 0.6, 0, s)
    ctx.bezierCurveTo(-s * 0.6, s * 0.6, -s * 0.8, -s * 0.6, 0, -s)
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

export function fallingMarigolds(ctx, t, W, H, { count = 14, seed = 7 } = {}) {
  for (let i = 0; i < count; i++) {
    const speed = 70 + rnd(i, seed) * 90
    const x = rnd(i, seed + 1) * W + Math.sin(t + i) * 40
    const y = ((rnd(i, seed + 2) * (H + 200) + t * speed) % (H + 200)) - 100
    marigold(ctx, x, y, 12 + rnd(i, seed + 3) * 10, i % 2 ? '#f59b1a' : '#ffc425')
  }
}

export function sparkles(ctx, t, W, H, { count = 40, color = '#ffe3a3', alpha = 1, seed = 3 } = {}) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < count; i++) {
    const x = rnd(i, seed) * W
    const y = ((rnd(i, seed + 1) * H - t * (12 + rnd(i, seed + 2) * 25)) % H + H) % H
    const tw = Math.max(0, Math.sin(t * (1.5 + rnd(i, seed + 3) * 2.5) + i * 2))
    const s = (2 + rnd(i, seed + 4) * 5) * tw
    if (s < 0.3) continue
    ctx.fillStyle = rgba(color, alpha * tw)
    ctx.beginPath()
    ctx.moveTo(x, y - s * 3)
    ctx.quadraticCurveTo(x, y, x + s * 3, y)
    ctx.quadraticCurveTo(x, y, x, y + s * 3)
    ctx.quadraticCurveTo(x, y, x - s * 3, y)
    ctx.quadraticCurveTo(x, y, x, y - s * 3)
    ctx.fill()
  }
  ctx.restore()
}

export function stars(ctx, t, W, H, { count = 90, seed = 11 } = {}) {
  for (let i = 0; i < count; i++) {
    const x = rnd(i, seed) * W
    const y = rnd(i, seed + 1) * H * 0.7
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + rnd(i, seed + 2) * 1.6) + i))
    ctx.fillStyle = `rgba(255,248,225,${tw})`
    ctx.beginPath()
    ctx.arc(x, y, 1 + rnd(i, seed + 3) * 2.2, 0, TAU)
    ctx.fill()
  }
}

export function risingLanterns(ctx, t, W, H, { count = 12, seed = 21 } = {}) {
  for (let i = 0; i < count; i++) {
    const speed = 35 + rnd(i, seed) * 45
    const depth = 0.5 + rnd(i, seed + 4) * 0.7
    const x = rnd(i, seed + 1) * W + Math.sin(t * 0.5 + i) * 30
    const y = H + 100 - ((rnd(i, seed + 2) * (H + 300) + t * speed * depth) % (H + 300))
    skyLantern(ctx, x, y, 22 * depth, t, i)
  }
}

export function confetti(ctx, t, W, H, { count = 40, colors = ['#e63946', '#ffbe0b', '#3a86ff', '#ff70a6', '#06d6a0'], seed = 13, alpha = 1 } = {}) {
  ctx.save()
  ctx.globalAlpha *= alpha
  for (let i = 0; i < count; i++) {
    const speed = 110 + rnd(i, seed) * 140
    const x = rnd(i, seed + 1) * W + Math.sin(t * 1.7 + i) * 40
    const y = ((rnd(i, seed + 2) * (H + 100) + t * speed) % (H + 100)) - 50
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(t * (2 + rnd(i, seed + 3) * 4) + i)
    ctx.scale(1, Math.cos(t * 5 + i))
    ctx.fillStyle = colors[i % colors.length]
    ctx.fillRect(-7, -4, 14, 8)
    ctx.restore()
  }
  ctx.restore()
}

export function floatingDots(ctx, t, W, H, { count = 30, color = '#c9a27e', seed = 5 } = {}) {
  for (let i = 0; i < count; i++) {
    const x = rnd(i, seed) * W + Math.sin(t * 0.4 + i) * 30
    const y = ((rnd(i, seed + 1) * H - t * (8 + rnd(i, seed + 2) * 14)) % H + H) % H
    ctx.fillStyle = rgba(color, 0.25 + rnd(i, seed + 3) * 0.35)
    ctx.beginPath()
    ctx.arc(x, y, 2 + rnd(i, seed + 4) * 5, 0, TAU)
    ctx.fill()
  }
}
