import { rgba, shade } from '../../lib/color.js'
import { clamp, ease, fadeWindow, prog, rnd } from '../anim.js'
import { divider } from '../ornaments.js'
import { sparkles } from '../particles.js'
import { roundRect } from '../scenes.js'
import { drawText } from '../text.js'
import { DEFAULT_TEXT, H, W, clipAbove } from './base.js'

const GOLD = '#f2c14e'
const RED = '#b0122b'
const STRIP = 54

function goldGradient(ctx, y, size, t) {
  // moving shine across gold lettering
  const shine = ((t * 0.6) % 1.6) - 0.3
  const g = ctx.createLinearGradient(0, y - size / 2, W, y + size / 2)
  g.addColorStop(0, '#b8862b')
  g.addColorStop(clamp(shine - 0.08), '#f2c14e')
  g.addColorStop(clamp(shine), '#fff6d5')
  g.addColorStop(clamp(shine + 0.08), '#f2c14e')
  g.addColorStop(1, '#b8862b')
  return g
}

function filmStrip(ctx, x, t) {
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(x, 0, STRIP, H)
  ctx.fillStyle = '#3a3a3a'
  const off = (t * 120) % 60
  for (let y = -60 + off; y < H; y += 60) {
    roundRect(ctx, x + 14, y, STRIP - 28, 34, 6)
    ctx.fill()
  }
}

function spotlight(ctx, fromX, fromY, toX, toY, width, alpha) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createLinearGradient(fromX, fromY, toX, toY)
  g.addColorStop(0, `rgba(255,240,200,${alpha})`)
  g.addColorStop(1, 'rgba(255,240,200,0)')
  ctx.fillStyle = g
  const ang = Math.atan2(toY - fromY, toX - fromX) + Math.PI / 2
  ctx.beginPath()
  ctx.moveTo(fromX - 10, fromY)
  ctx.lineTo(toX + Math.cos(ang) * width, toY + Math.sin(ang) * width)
  ctx.lineTo(toX - Math.cos(ang) * width, toY - Math.sin(ang) * width)
  ctx.lineTo(fromX + 10, fromY)
  ctx.fill()
  ctx.restore()
}

function curtain(ctx, x, w, side, t) {
  const folds = 6
  for (let i = 0; i < folds; i++) {
    const fx = x + (i * w) / folds
    const sway = Math.sin(t * 1.2 + i) * 4
    const g = ctx.createLinearGradient(fx, 0, fx + w / folds, 0)
    g.addColorStop(0, shade(RED, -0.45))
    g.addColorStop(0.5, RED)
    g.addColorStop(1, shade(RED, -0.45))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(fx, 150)
    ctx.lineTo(fx + w / folds, 150)
    ctx.lineTo(fx + w / folds + sway + side * 8, 1300)
    ctx.lineTo(fx + sway + side * 8, 1300)
    ctx.fill()
  }
}

function clapperboard(ctx, local, theme) {
  const F = theme.fonts
  const exit = prog(local, 1.5, 0.4)
  if (exit >= 1) return
  const snap = ease.inQuad(prog(local, 0.3, 0.55))
  ctx.save()
  ctx.globalAlpha *= 1 - exit
  ctx.translate(W / 2, 820)
  ctx.scale(1 - exit * 0.3, 1 - exit * 0.3)
  ctx.rotate(-0.04)
  // board
  ctx.fillStyle = '#1b1b1b'
  roundRect(ctx, -300, -120, 600, 400, 18)
  ctx.fill()
  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(-280, 40)
  ctx.lineTo(280, 40)
  ctx.moveTo(-280, 150)
  ctx.lineTo(280, 150)
  ctx.moveTo(0, 40)
  ctx.lineTo(0, 150)
  ctx.stroke()
  drawText(ctx, theme.tagline.main, 0, -50, { family: F.title, size: 82, color: '#fff', maxWidth: 540, spacing: 4 })
  drawText(ctx, 'SCENE 1', -140, 96, { family: F.title, size: 54, color: '#eee', maxWidth: 260 })
  drawText(ctx, 'TAKE 1', 140, 96, { family: F.title, size: 54, color: '#eee', maxWidth: 260 })
  drawText(ctx, 'DIRECTED BY DESTINY', 0, 214, { family: F.title, size: 50, color: GOLD, maxWidth: 540, spacing: 3 })
  // clapper bar: hinged at the left, snaps shut
  for (const [y, ang] of [[-120, -0.55 * (1 - snap)], [-120, 0]]) {
    ctx.save()
    ctx.translate(-300, y)
    ctx.rotate(ang)
    ctx.fillStyle = '#1b1b1b'
    ctx.fillRect(0, -64, 600, 60)
    ctx.fillStyle = '#f5f5f5'
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 100 + 20, -64)
      ctx.lineTo(i * 100 + 70, -64)
      ctx.lineTo(i * 100 + 40, -4)
      ctx.lineTo(i * 100 - 10, -4)
      ctx.fill()
    }
    ctx.restore()
    if (ang === 0) break
  }
  ctx.restore()
  // white flash on the snap
  const flash = 1 - prog(local, 0.85, 0.35)
  if (local > 0.85 && flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash * 0.8})`
    ctx.fillRect(0, 0, W, H)
  }
}

function opening(ctx, local, dur, env) {
  const { theme, t } = env
  const F = theme.fonts
  const P = theme.palette
  const a = fadeWindow(local, dur, 0.3, 0.6)
  ctx.save()
  ctx.globalAlpha *= a
  clapperboard(ctx, local, theme)
  const tp = prog(local, 1.8, 0.8)
  if (tp > 0) {
    drawText(ctx, theme.tagline.sub.toUpperCase(), W / 2, 640, { family: F.title, size: 56, color: P.soft, spacing: 10, alpha: tp, maxWidth: 900 })
    const s = 0.8 + 0.2 * ease.outBack(tp)
    ctx.save()
    ctx.translate(W / 2, 860)
    ctx.scale(s, s)
    drawText(ctx, theme.tagline.main, 0, 0, { family: F.title, size: 210, color: goldGradient(ctx, 0, 210, t), maxWidth: 900, alpha: tp, shadow: theme.glow, spacing: 6 })
    ctx.restore()
    if (theme.tagline.deva) drawText(ctx, theme.tagline.deva, W / 2, 1050, { family: F.deva, size: 110, color: P.heading, alpha: prog(local, 2.3, 0.6), shadow: theme.glow })
    divider(ctx, W / 2, 1170, 360, P.accent, ease.outCubic(prog(local, 2.5, 0.7)))
    drawText(ctx, 'COMING SOON TO YOUR HEARTS', W / 2, 1260, { family: F.title, size: 54, color: P.text, spacing: 8, alpha: prog(local, 2.8, 0.6), maxWidth: 900 })
  }
  ctx.restore()
}

export default {
  id: 'filmy',
  name: 'Bollywood Filmy',
  description: 'Blockbuster vibes: clapperboard, spotlights, red curtains and your wedding as the big release.',
  music: 'bhangra',
  openingDuration: 5,
  palette: {
    text: '#f5eedd',
    heading: GOLD,
    accent: GOLD,
    soft: '#c9b48a',
    card: 'rgba(20,10,12,.78)',
    cardStroke: rgba(GOLD, 0.8),
    medallion: '#1a0d10',
    heart: '#ff3d5a',
  },
  fonts: { title: 'Bebas Neue', script: 'Great Vibes', scriptStyle: 'normal', body: 'Cormorant Garamond', deva: 'Yatra One' },
  glow: { color: 'rgba(242,193,78,.55)', blur: 26 },
  tagline: { deva: 'शुभ विवाह', main: 'A LOVE STORY', sub: 'Two families proudly present' },
  ...DEFAULT_TEXT,
  coupleLine: 'STARRING IN A LIFETIME BLOCKBUSTER',
  dateHeading: 'Releasing On',
  timePrefix: 'Show starts at',
  eventsHeading: 'Show Schedule',
  photoHeading: 'The Stars',
  thanks: 'Book your seats!',
  emblem: 'kalash',
  coupleEffect: 'fireworks',
  garland: ['#f59b1a', '#ffc425', '#e8364f'],
  scenes: { opening },

  background(ctx, t) {
    const g = ctx.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H * 0.45, H * 0.85)
    g.addColorStop(0, '#3a0d17')
    g.addColorStop(0.6, '#16070a')
    g.addColorStop(1, '#050203')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    // sweeping searchlights
    const sw = Math.sin(t * 0.7) * 260
    spotlight(ctx, 120, H + 40, W / 2 + sw, -100, 160, 0.13)
    spotlight(ctx, W - 120, H + 40, W / 2 - sw, -100, 160, 0.13)
  },
  particles(ctx, t) {
    sparkles(ctx, t, W, H, { count: 40, color: '#ffe3a3' })
    // paparazzi camera flashes
    const k = Math.floor(t / 1.3)
    const local = t - k * 1.3
    if (local < 0.25) {
      const x = 120 + rnd(k, 1) * (W - 240)
      const y = 200 + rnd(k, 2) * (H - 400)
      const a = 1 - local / 0.25
      const fg = ctx.createRadialGradient(x, y, 0, x, y, 180)
      fg.addColorStop(0, `rgba(255,255,255,${0.8 * a})`)
      fg.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = fg
      ctx.fillRect(x - 180, y - 180, 360, 360)
    }
  },
  foreground(ctx, t) {
    filmStrip(ctx, 0, t)
    filmStrip(ctx, W - STRIP, -t)
    // film grain
    ctx.fillStyle = 'rgba(255,255,255,.06)'
    const f = Math.floor(t * 24)
    for (let i = 0; i < 160; i++) ctx.fillRect(rnd(i, f) * W, rnd(i, f + 1) * H, 2, 2)
    // vignette
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75)
    v.addColorStop(0, 'rgba(0,0,0,0)')
    v.addColorStop(1, 'rgba(0,0,0,.55)')
    ctx.fillStyle = v
    ctx.fillRect(0, 0, W, H)
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    const { t } = env
    const p = ease.outCubic(prog(local, 0, 1))
    ctx.save()
    ctx.globalAlpha *= p
    // stage back wall
    ctx.fillStyle = '#12060a'
    ctx.fillRect(STRIP, 150, W - STRIP * 2, archBottom - 150)
    // curtains part from the centre
    const open = ease.inOutCubic(prog(local, 0, 1.2))
    curtain(ctx, STRIP, 160 + (1 - open) * 330, 1, t)
    curtain(ctx, W - STRIP - 160 - (1 - open) * 330, 160 + (1 - open) * 330, -1, t)
    // valance with gold fringe
    ctx.fillStyle = shade(RED, -0.25)
    ctx.fillRect(STRIP, 130, W - STRIP * 2, 80)
    for (let x = STRIP; x < W - STRIP; x += 60) {
      ctx.beginPath()
      ctx.arc(x + 30, 210, 30, 0, Math.PI)
      ctx.fill()
    }
    ctx.strokeStyle = GOLD
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(STRIP, 210)
    ctx.lineTo(W - STRIP, 210)
    ctx.stroke()
    drawText(ctx, 'STARRING', W / 2, 300, { family: env.theme.fonts.title, size: 64, color: GOLD, spacing: 14, alpha: prog(local, 0.8, 0.6) })
    ctx.restore()
    const sp = prog(local, 1, 0.8)
    spotlight(ctx, 300, 140, 360, archBottom, 240, 0.22 * sp)
    spotlight(ctx, W - 300, 140, 720, archBottom, 240, 0.22 * sp)
  },
  clipStage(ctx, archBottom) {
    clipAbove(ctx, archBottom)
  },
  stageFront(ctx, archBottom, t) {
    const g = ctx.createLinearGradient(0, archBottom, 0, archBottom + 70)
    g.addColorStop(0, '#5a1a10')
    g.addColorStop(1, '#1a0806')
    ctx.fillStyle = g
    ctx.fillRect(STRIP, archBottom - 4, W - STRIP * 2, 70)
    ctx.fillStyle = GOLD
    ctx.fillRect(STRIP, archBottom - 6, W - STRIP * 2, 6)
    // footlights
    for (let i = 0; i < 9; i++) {
      const x = 120 + i * 105
      const on = 0.6 + 0.4 * Math.sin(t * 4 + i)
      const fg = ctx.createRadialGradient(x, archBottom + 30, 0, x, archBottom + 30, 40)
      fg.addColorStop(0, `rgba(255,230,160,${on})`)
      fg.addColorStop(1, 'rgba(255,200,100,0)')
      ctx.fillStyle = fg
      ctx.fillRect(x - 40, archBottom - 10, 80, 80)
    }
  },
  closingBase(ctx, y) {
    ctx.fillStyle = '#1a0806'
    ctx.fillRect(W / 2 - 320, y, 640, 50)
    ctx.fillStyle = GOLD
    ctx.fillRect(W / 2 - 320, y, 640, 6)
  },
}
