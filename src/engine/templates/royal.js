import { rgba } from '../../lib/color.js'
import { clamp, ease, prog } from '../anim.js'
import { garlandString, mandala, ornateFrame, toran } from '../ornaments.js'
import { petals, sparkles } from '../particles.js'
import { DEFAULT_TEXT, H, W, archBackdrop, clipAbove, flowerBank, goldLedge } from './base.js'

const GOLD = '#d4a64a'
const MAROON = '#5a0f1c'

function door(ctx, x, w, side) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0)
  g.addColorStop(0, side < 0 ? '#4a0a16' : '#7a1428')
  g.addColorStop(1, side < 0 ? '#7a1428' : '#4a0a16')
  ctx.fillStyle = g
  ctx.fillRect(x, 0, w, H)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 6
  ctx.strokeRect(x + 30, 60, w - 60, H - 120)
  ctx.lineWidth = 2
  ctx.strokeRect(x + 50, 80, w - 100, H - 160)
  mandala(ctx, x + w / 2, H / 2, Math.min(200, w * 0.38), GOLD, 0, 1, 2.5)
  for (const yy of [360, H - 360]) mandala(ctx, x + w / 2, yy, 90, rgba(GOLD, 0.8), 0, 1, 2)
  // handle ring
  ctx.beginPath()
  ctx.arc(side < 0 ? x + w - 40 : x + 40, H / 2 + 260, 26, 0, Math.PI * 2)
  ctx.stroke()
}

export default {
  id: 'royal',
  name: 'Royal Mandap',
  description: 'Maroon & gold with a mandap, bells, marigold toran and opening palace doors.',
  music: 'royal',
  palette: {
    text: '#fbe9cf',
    heading: '#f6d98e',
    accent: GOLD,
    soft: '#e6c39a',
    card: 'rgba(58,6,16,.62)',
    cardStroke: rgba(GOLD, 0.8),
    medallion: '#3a0610',
    heart: '#e8364f',
  },
  fonts: { title: 'Cinzel', script: 'Great Vibes', scriptStyle: 'normal', body: 'Cormorant Garamond', deva: 'Yatra One' },
  glow: { color: 'rgba(255,200,90,.45)', blur: 22 },
  tagline: { deva: 'शुभ विवाह', main: 'SHUBH VIVAH', sub: 'Two souls, one sacred bond' },
  ...DEFAULT_TEXT,
  emblem: 'kalash',
  coupleEffect: 'varmala',
  garland: ['#f59b1a', '#ffc425', '#e8364f'],

  background(ctx, t) {
    const g = ctx.createRadialGradient(W / 2, H * 0.42, 80, W / 2, H * 0.45, H * 0.8)
    g.addColorStop(0, '#8e1a32')
    g.addColorStop(0.55, MAROON)
    g.addColorStop(1, '#22040a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    mandala(ctx, W / 2, H * 0.45, 760, rgba(GOLD, 0.07), t * 0.04, 1, 3)
    mandala(ctx, 0, H, 420, rgba(GOLD, 0.08), -t * 0.05, 1, 2)
    mandala(ctx, W, 0, 420, rgba(GOLD, 0.08), t * 0.05, 1, 2)
  },
  particles(ctx, t) {
    sparkles(ctx, t, W, H, { count: 45, color: '#ffe3a3' })
    petals(ctx, t, W, H, { count: 18, colors: ['#e63950', '#c21d3a', '#ff8fa3'], alpha: 0.9 })
  },
  foreground(ctx, t, env) {
    ornateFrame(ctx, W, H, rgba(GOLD, 0.9), ease.outCubic(clamp(env.t / 2.5)))
    toran(ctx, W, 26, t, { colors: ['#f59b1a', '#ffc425'], bellColor: GOLD })
  },
  openingOverlay(ctx, local) {
    if (local > 2.4) return
    const p = ease.inOutCubic(prog(local, 0.3, 2))
    const half = W / 2
    ctx.save()
    door(ctx, -p * half, half, -1)
    door(ctx, half + p * half, half, 1)
    ctx.restore()
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    archBackdrop(ctx, local, archBottom, { line: GOLD, fill: 'rgba(40,4,10,.55)', inner: rgba(GOLD, 0.5) })
    // hanging marigold strings inside the mandap
    const p = ease.outCubic(prog(local, 0.2, 1))
    for (const [x, len, s] of [[150, 520, 1], [930, 520, 2], [210, 380, 3], [870, 380, 4]]) {
      garlandString(ctx, x, 250, len * p, env.t, { r: 18, seed: s, tassel: p > 0.95 })
    }
  },
  clipStage(ctx, archBottom) {
    clipAbove(ctx, archBottom)
  },
  stageFront(ctx, archBottom, t) {
    goldLedge(ctx, archBottom, GOLD)
    flowerBank(ctx, archBottom - 4, t, ['#f59b1a', '#ffc425', '#e8364f'], 900, 90)
  },
  closingBase(ctx, y, t) {
    flowerBank(ctx, y - 10, t, ['#f59b1a', '#ffc425', '#e8364f'], 560, 260)
  },
}
