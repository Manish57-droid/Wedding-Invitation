import { shade } from '../../lib/color.js'
import { marigold, arch } from '../ornaments.js'
import { rnd } from '../anim.js'

export const W = 1080
export const H = 1920

/** Bank of marigolds that hides the bottom edge of the avatars. */
export function flowerBank(ctx, y, t, colors = ['#f59b1a', '#ffc425', '#e8364f'], width = W, x0 = 0) {
  for (let row = 0; row < 3; row++) {
    const r = 30 - row * 3
    const n = Math.ceil(width / (r * 1.5)) + 1
    for (let i = 0; i < n; i++) {
      const x = x0 + i * r * 1.5 + (row % 2) * r * 0.75
      const yy = y - 6 + row * 26 + Math.sin(t * 1.5 + i * 0.7) * 2 + rnd(i, row) * 8
      marigold(ctx, x, yy, r, colors[(i + row) % colors.length])
    }
  }
}

/** Default arch backdrop for the couple; templates override the colours. */
export function archBackdrop(ctx, local, archBottom, { line, fill, inner }) {
  const p = Math.min(1, local / 0.8)
  ctx.save()
  ctx.globalAlpha *= p
  arch(ctx, W / 2, archBottom, 880, 1000, line, fill, 6)
  if (inner) arch(ctx, W / 2, archBottom, 830, 950, inner, null, 2)
  ctx.restore()
}

export function clipAbove(ctx, y) {
  ctx.beginPath()
  ctx.rect(0, 0, W, y)
  ctx.clip()
}

export function goldLedge(ctx, y, gold) {
  const g = ctx.createLinearGradient(0, y, 0, y + 40)
  g.addColorStop(0, shade(gold, 0.3))
  g.addColorStop(1, shade(gold, -0.35))
  ctx.fillStyle = g
  ctx.fillRect(W / 2 - 470, y - 4, 940, 30)
}

export const DEFAULT_TEXT = {
  coupleLine: 'ARE GETTING MARRIED',
  dateHeading: 'Save the Date',
  timePrefix: 'Muhurat at',
  eventsHeading: 'Celebrations',
  photoHeading: 'The Couple',
  photoLine: 'Two hearts, one beautiful journey',
  thanks: 'See you there!',
}
