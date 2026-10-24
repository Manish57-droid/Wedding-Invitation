import { clamp, ease, prog } from '../anim.js'
import { roundRect } from '../scenes.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, halftone, stageCard, starburst } from './kit.js'

const INK = '#111111'
const RED = '#ff3b30'
const YELLOW = '#ffd60a'
const BLUE = '#1e88e5'

function speechBubble(ctx, text, x, y, w, tailX, tailY, p) {
  if (p <= 0 || !text) return
  ctx.save()
  const s = ease.outBack(clamp(p))
  ctx.translate(tailX, tailY)
  ctx.scale(s, s)
  ctx.translate(-tailX, -tailY)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = INK
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.ellipse(x, y, w / 2, 90, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - 30, y + 70)
  ctx.lineTo(tailX, tailY)
  ctx.lineTo(x + 30, y + 80)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.fillRect(x - 34, y + 56, 68, 22)
  ctx.restore()
  drawText(ctx, text, x, y, { family: 'Bangers', size: 64, color: INK, maxWidth: w - 70, alpha: clamp(p * 2), spacing: 2 })
}

function opening(ctx, local, dur, env) {
  const { theme, t } = env
  const T = theme.texts
  const a = Math.min(clamp(local / 0.2), clamp((dur - local) / 0.5))
  ctx.save()
  ctx.globalAlpha *= a
  const bp = ease.outElastic(prog(local, 0.1, 1))
  starburst(ctx, W / 2, 620, 360 * bp, { fill: RED, rot: t * 0.2, points: 16 })
  starburst(ctx, W / 2, 620, 280 * bp, { fill: YELLOW, rot: -t * 0.25, points: 16, lineWidth: 6 })
  ctx.save()
  ctx.translate(W / 2, 620)
  ctx.rotate(-0.08)
  drawText(ctx, T.boom, 0, 0, { family: 'Bangers', size: 150 * bp, color: RED, maxWidth: 480, stroke: { color: INK, width: 10 }, spacing: 4 })
  ctx.restore()
  const mp = ease.outBack(prog(local, 1, 0.6))
  if (mp > 0) {
    ctx.save()
    ctx.translate(W / 2, 1080)
    ctx.rotate(0.03)
    ctx.scale(mp, mp)
    ctx.fillStyle = BLUE
    ctx.strokeStyle = INK
    ctx.lineWidth = 8
    roundRect(ctx, -460, -110, 920, 220, 10)
    ctx.fill()
    ctx.stroke()
    drawText(ctx, T.main, 0, 0, { family: 'Bangers', size: 120, color: '#fff', maxWidth: 860, stroke: { color: INK, width: 8 }, spacing: 3 })
    ctx.restore()
  }
  speechBubble(ctx, T.sub, W / 2, 1420, 860, W / 2 + 160, 1580, prog(local, 1.6, 0.5))
  ctx.restore()
}

export default {
  id: 'comic',
  name: 'Comic Pop',
  description: 'POW! KA-BOOM! Pop-art comic panels, halftone dots and speech bubbles.',
  music: 'funky',
  category: 'Funny',
  palette: { text: INK, heading: RED, accent: BLUE, soft: '#333', card: '#ffffff', cardStroke: INK, medallion: '#fff', heart: RED },
  fonts: { title: 'Bangers', script: 'Bangers', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: null,
  titleStroke: { color: INK, width: 8 },
  texts: {
    deva: '',
    boom: 'KA-BOOM!',
    pow: 'POW!',
    zap: 'ZAP!',
    main: 'BREAKING: SHAADI!',
    sub: 'Our heroes are getting married!',
    speech: 'We said YES!',
    coupleLine: 'THE ULTIMATE TEAM-UP',
    dateHeading: 'Mark the date!',
    timePrefix: 'Action at',
    eventsHeading: 'Episodes',
    thanks: 'To be continued… forever!',
  },
  textLabels: [['boom', 'Burst word'], ['pow', 'Corner word 1'], ['zap', 'Corner word 2'], ['speech', 'Speech bubble']],
  scenes: { opening },
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: [RED, YELLOW, BLUE],
  background(ctx) {
    ctx.fillStyle = YELLOW
    ctx.fillRect(0, 0, W, H)
    halftone(ctx, 'rgba(255,59,48,.55)', { spacing: 34, maxR: 9, cx: W, cy: 0 })
    halftone(ctx, 'rgba(30,136,229,.35)', { spacing: 34, maxR: 9, cx: 0, cy: H })
  },
  particles() {},
  foreground(ctx, t, env) {
    ctx.strokeStyle = INK
    ctx.lineWidth = 14
    ctx.strokeRect(24, 24, W - 48, H - 48)
    starburst(ctx, 110, 150, 70 + Math.sin(t * 4) * 6, { fill: '#fff', points: 10, lineWidth: 5 })
    drawText(ctx, env.theme.texts.pow, 110, 150, { family: 'Bangers', size: 46, color: RED, maxWidth: 110 })
    starburst(ctx, W - 110, H - 150, 70 + Math.cos(t * 4) * 6, { fill: '#fff', points: 10, lineWidth: 5 })
    drawText(ctx, env.theme.texts.zap, W - 110, H - 150, { family: 'Bangers', size: 46, color: BLUE, maxWidth: 110 })
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: '#7fd3ff', stroke: INK, lineWidth: 12, r: 8 })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 8 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 50, INK, null)
  },
  coupleOverlay(ctx, local, env) {
    speechBubble(ctx, env.theme.texts.speech, 740, 360, 460, 760, 560, prog(local, 2.4, 0.5))
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, INK, null)
  },
}
