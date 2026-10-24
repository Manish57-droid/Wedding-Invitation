import { rnd } from '../anim.js'
import { sparkles } from '../particles.js'
import { roundRect } from '../scenes.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, emoji, emojiFloat, rgba, stageCard, TAU } from './kit.js'

const PINK = '#ff8fc7'
const LILAC = '#b79cff'
const MINT = '#8ef0d0'

function blob(ctx, x, y, r, color, t, seed) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let k = 0; k <= 60; k++) {
    const a = (k / 60) * TAU
    const rr = r * (1 + 0.12 * Math.sin(a * 3 + t * 0.8 + seed) + 0.06 * Math.sin(a * 5 - t + seed))
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  ctx.fill()
}

function sticker(ctx, text, x, y, rot, bg, color, s = 1) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.scale(s, s)
  ctx.font = '700 44px "Fredoka", sans-serif'
  const w = ctx.measureText(text).width + 60
  ctx.fillStyle = '#fff'
  roundRect(ctx, -w / 2 - 8, -46, w + 16, 92, 46)
  ctx.fill()
  ctx.fillStyle = bg
  roundRect(ctx, -w / 2, -38, w, 76, 38)
  ctx.fill()
  ctx.restore()
  drawText(ctx, text, x, y, { family: 'Fredoka', size: 44 * s, weight: 700, color, maxWidth: 600 })
}

export default {
  id: 'bubblegum',
  name: 'Bubblegum Gen-Z',
  description: 'Pastel blobs, stickers and floating emojis. Main character energy only.',
  music: 'bhangra',
  category: 'Gen-Z',
  palette: { text: '#5a3d6e', heading: '#e0428f', accent: '#7b5cff', soft: '#8d73a8', card: 'rgba(255,255,255,.85)', cardStroke: LILAC, medallion: '#fff4fb', heart: '#ff5fa2' },
  fonts: { title: 'Fredoka', script: 'Pacifico', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: null,
  texts: {
    deva: '',
    main: "it's a shaadi! 💕",
    sub: "and you're on the guest list ✨",
    coupleLine: 'MAIN CHARACTER ENERGY',
    dateHeading: 'save the date ✨',
    timePrefix: 'vibes start at',
    eventsHeading: 'the vibe schedule',
    thanks: 'see u there bestie 🫶',
    sticker1: 'omg!',
    sticker2: 'no cap',
  },
  textLabels: [['sticker1', 'Sticker 1'], ['sticker2', 'Sticker 2']],
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: [PINK, LILAC, MINT],
  background(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#ffe3f1')
    g.addColorStop(0.5, '#efe4ff')
    g.addColorStop(1, '#ddfff4')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    blob(ctx, 120, 260, 260, rgba(PINK, 0.35), t, 1)
    blob(ctx, 980, 900, 300, rgba(LILAC, 0.35), t, 2)
    blob(ctx, 200, 1650, 320, rgba(MINT, 0.4), t, 3)
  },
  particles(ctx, t) {
    sparkles(ctx, t, W, H, { count: 30, color: '#ffffff' })
    emojiFloat(ctx, t, ['💖', '✨', '🫶', '🥹', '🎀', '💍'], { count: 12, size: 52, alpha: 0.85 })
    // bubbles
    ctx.strokeStyle = 'rgba(255,255,255,.8)'
    ctx.lineWidth = 3
    for (let i = 0; i < 10; i++) {
      const x = rnd(i, 41) * W + Math.sin(t + i) * 20
      const y = H + 60 - ((rnd(i, 42) * (H + 120) + t * 60) % (H + 120))
      ctx.beginPath()
      ctx.arc(x, y, 14 + rnd(i, 43) * 26, 0, TAU)
      ctx.stroke()
    }
  },
  foreground(ctx, t) {
    emoji(ctx, '🌸', 80, 90, 70)
    emoji(ctx, '⭐', 1000, 120, 60, 0.9)
    emoji(ctx, '🦋', 990, 1830, 70)
    void t
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, {
      fill: (c, top, bottom) => {
        const g = c.createLinearGradient(0, top, 0, bottom)
        g.addColorStop(0, '#ffd1ea')
        g.addColorStop(1, '#d9c9ff')
        c.fillStyle = g
        c.fill()
      },
      stroke: '#fff',
      lineWidth: 14,
      r: 70,
    })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 70 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 40, '#fff', null)
  },
  coupleOverlay(ctx, local, env) {
    const T = env.theme.texts
    const p = Math.min(1, Math.max(0, (local - 2.6) / 0.4))
    if (p <= 0) return
    if (T.sticker1) sticker(ctx, T.sticker1, 230, 330, -0.18, PINK, '#fff', p)
    if (T.sticker2) sticker(ctx, T.sticker2, 850, 420, 0.15, MINT, '#2d5a4c', p)
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, '#fff', null)
  },
}
