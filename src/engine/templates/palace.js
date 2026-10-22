import { rgba } from '../../lib/color.js'
import { clamp, ease, prog } from '../anim.js'
import { firework, ornateFrame, palace } from '../ornaments.js'
import { risingLanterns, sparkles, stars } from '../particles.js'
import { DEFAULT_TEXT, H, W, archBackdrop, clipAbove, flowerBank, goldLedge } from './base.js'

const GOLD = '#e0b660'

function stringLights(ctx, t) {
  for (let s = 0; s < 3; s++) {
    const x0 = (s * W) / 3
    const x1 = ((s + 1) * W) / 3
    for (let i = 0; i <= 14; i++) {
      const f = i / 14
      const x = x0 + (x1 - x0) * f
      const y = 70 + Math.sin(f * Math.PI) * 70
      const on = 0.55 + 0.45 * Math.sin(t * 3 + i + s * 2)
      const g = ctx.createRadialGradient(x, y, 0, x, y, 18)
      g.addColorStop(0, `rgba(255,236,170,${on})`)
      g.addColorStop(1, 'rgba(255,200,90,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(255,248,215,${0.6 + on * 0.4})`
      ctx.beginPath()
      ctx.arc(x, y, 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

export default {
  id: 'palace',
  name: 'Palace Night',
  description: 'Starry Rajasthani night with sky lanterns, a glowing palace and fireworks.',
  music: 'dreamy',
  palette: {
    text: '#f6ead2',
    heading: '#f7d690',
    accent: GOLD,
    soft: '#c8c0e6',
    card: 'rgba(18,20,58,.66)',
    cardStroke: rgba(GOLD, 0.7),
    medallion: '#1b1b4a',
    heart: '#ff7a9c',
  },
  fonts: { title: 'Cinzel', script: 'Great Vibes', scriptStyle: 'normal', body: 'Cormorant Garamond', deva: 'Yatra One' },
  glow: { color: 'rgba(255,214,140,.5)', blur: 24 },
  tagline: { deva: 'शुभ विवाह', main: 'A ROYAL CELEBRATION', sub: 'Under the stars, forever begins' },
  ...DEFAULT_TEXT,
  emblem: 'kalash',
  coupleEffect: 'fireworks',
  garland: ['#f59b1a', '#ffc425', '#e8364f'],

  background(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#070a24')
    g.addColorStop(0.5, '#1a1a4e')
    g.addColorStop(1, '#3d2361')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    stars(ctx, t, W, H)
    // moon
    const mx = 880
    const my = 210
    const mg = ctx.createRadialGradient(mx, my, 40, mx, my, 260)
    mg.addColorStop(0, 'rgba(255,240,200,.35)')
    mg.addColorStop(1, 'rgba(255,240,200,0)')
    ctx.fillStyle = mg
    ctx.beginPath()
    ctx.arc(mx, my, 260, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fbf0d0'
    ctx.beginPath()
    ctx.arc(mx, my, 62, 0, Math.PI * 2)
    ctx.fill()
    risingLanterns(ctx, t, W, H, { count: 10 })
    // a smaller palace keeps the bottom third free for text
    ctx.save()
    ctx.translate(W / 2, H)
    ctx.scale(0.6, 0.6)
    ctx.translate(-W / 2, -H)
    palace(ctx, W, H, '#0b0b26', '#ffc86b', t)
    ctx.restore()
    ctx.fillStyle = '#0b0b26'
    ctx.fillRect(0, H - 66, W, 66)
  },
  particles(ctx, t) {
    sparkles(ctx, t, W, H, { count: 30, color: '#ffe6a8' })
  },
  foreground(ctx, t, env) {
    ornateFrame(ctx, W, H, rgba(GOLD, 0.75), ease.outCubic(clamp(env.t / 2.5)), 40)
    stringLights(ctx, t)
  },
  openingOverlay(ctx, local) {
    firework(ctx, 240, 380, prog(local, 0.4, 1.8), '#ffd27a', 11)
    firework(ctx, 840, 520, prog(local, 0.9, 1.8), '#ff9fc0', 12)
    firework(ctx, 540, 260, prog(local, 1.5, 1.8), '#a8e8ff', 13, 260)
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    archBackdrop(ctx, local, archBottom, { line: GOLD, fill: 'rgba(10,10,40,.55)', inner: rgba(GOLD, 0.45) })
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
