import { rgba } from '../../lib/color.js'
import { ease, prog, rnd } from '../anim.js'
import { diya, garlandString, leaf, mandala, swag } from '../ornaments.js'
import { fallingMarigolds, petals } from '../particles.js'
import { DEFAULT_TEXT, H, W, archBackdrop, clipAbove, flowerBank } from './base.js'

const ORANGE = '#e0731b'
const DEEP = '#8c1d2f'

const SIDE_STRINGS = [
  [40, 430], [110, 300], [180, 190],
  [W - 40, 430], [W - 110, 300], [W - 180, 190],
]

export default {
  id: 'marigold',
  name: 'Marigold Mehendi',
  description: 'Sunny haldi & mehendi vibes: genda phool garlands, sun rays, glowing diyas.',
  music: 'festive',
  palette: {
    text: '#5a2306',
    heading: DEEP,
    accent: ORANGE,
    soft: '#9a4a12',
    card: 'rgba(255,250,232,.82)',
    cardStroke: rgba(ORANGE, 0.75),
    medallion: '#fff6dc',
    heart: '#e8364f',
  },
  fonts: { title: 'Cinzel', script: 'Great Vibes', scriptStyle: 'normal', body: 'Cormorant Garamond', deva: 'Yatra One' },
  glow: { color: 'rgba(255,255,255,.7)', blur: 14 },
  tagline: { deva: 'शुभ विवाह', main: 'SHUBH VIVAH', sub: 'Let the festivities begin!' },
  ...DEFAULT_TEXT,
  eventsHeading: 'Festivities',
  emblem: 'kalash',
  coupleEffect: 'varmala',
  garland: ['#f59b1a', '#ffc425', '#e8364f'],

  background(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#fff7d6')
    g.addColorStop(0.55, '#ffd877')
    g.addColorStop(1, '#ffab3d')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    // slow rotating sun rays
    ctx.save()
    ctx.translate(W / 2, H * 0.36)
    ctx.rotate(t * 0.05)
    ctx.fillStyle = 'rgba(255,255,255,.18)'
    for (let i = 0; i < 18; i++) {
      ctx.rotate((Math.PI * 2) / 18)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(-90, -1600)
      ctx.lineTo(90, -1600)
      ctx.fill()
    }
    ctx.restore()
    mandala(ctx, W / 2, H * 0.36, 520, rgba('#e0731b', 0.14), -t * 0.06, 1, 3)
  },
  particles(ctx, t) {
    fallingMarigolds(ctx, t, W, H, { count: 10 })
    petals(ctx, t, W, H, { count: 14, colors: ['#ffb000', '#ff7a00', '#e8364f'], seed: 9 })
  },
  foreground(ctx, t) {
    for (let s = 0; s < 4; s++) swag(ctx, (s * W) / 4, ((s + 1) * W) / 4, 10, 60, t, { r: 20, colors: ['#f59b1a', '#ffc425', '#e8364f'], seed: s })
    SIDE_STRINGS.forEach(([x, len], i) => garlandString(ctx, x, 0, len, t, { r: 21, seed: i + 1, colors: i % 2 ? ['#ffc425', '#f59b1a'] : ['#f59b1a', '#ffc425'] }))
    for (let i = 0; i < 6; i++) diya(ctx, 110 + i * 172, H - 70, 34, t, i)
    for (let i = 0; i < 12; i++) leaf(ctx, i * 96 + rnd(i, 2) * 30, H - 30, 70, -Math.PI / 2 + (rnd(i, 3) - 0.5) * 0.9, i % 2 ? '#2f7a3a' : '#3a8f45')
  },
  openingOverlay(ctx, local, env) {
    if (local > 2.6) return
    // a curtain of garlands is drawn up like a theatre curtain
    const p = ease.inOutCubic(prog(local, 0.4, 2))
    const n = 14
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * (W / n)
      const len = (H + 60) * (1 - p) * (0.85 + rnd(i, 7) * 0.15)
      if (len > 30) garlandString(ctx, x, -10, len, env.t, { r: 26, seed: i, tassel: false, colors: i % 2 ? ['#ffc425', '#f59b1a'] : ['#f59b1a', '#e8364f'] })
    }
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    archBackdrop(ctx, local, archBottom, { line: ORANGE, fill: 'rgba(255,248,225,.55)', inner: rgba('#2f7a3a', 0.6) })
  },
  clipStage(ctx, archBottom) {
    clipAbove(ctx, archBottom)
  },
  stageFront(ctx, archBottom, t) {
    flowerBank(ctx, archBottom - 4, t, ['#f59b1a', '#ffc425', '#e8364f'], 920, 80)
  },
  closingBase(ctx, y, t) {
    flowerBank(ctx, y - 10, t, ['#f59b1a', '#ffc425', '#e8364f'], 560, 260)
  },
}
