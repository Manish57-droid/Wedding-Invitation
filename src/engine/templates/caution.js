import { clamp, ease, prog } from '../anim.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, cautionTape, clipCard, closingBand, emoji, stageCard } from './kit.js'

const YEL = '#ffd60a'
const INK = '#141414'

function warningSign(ctx, x, y, s, flash) {
  ctx.save()
  ctx.translate(x, y)
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.lineTo(s * 1.1, s * 0.85)
  ctx.lineTo(-s * 1.1, s * 0.85)
  ctx.closePath()
  ctx.fillStyle = flash ? '#ff3b30' : YEL
  ctx.fill()
  ctx.lineJoin = 'round'
  ctx.lineWidth = s * 0.12
  ctx.strokeStyle = INK
  ctx.stroke()
  ctx.fillStyle = INK
  ctx.fillRect(-s * 0.08, -s * 0.45, s * 0.16, s * 0.75)
  ctx.beginPath()
  ctx.arc(0, s * 0.55, s * 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function opening(ctx, local, dur, env) {
  const { theme, t } = env
  const T = theme.texts
  const a = Math.min(clamp(local / 0.2), clamp((dur - local) / 0.5))
  ctx.save()
  ctx.globalAlpha *= a
  const sp = ease.outElastic(prog(local, 0.1, 1))
  warningSign(ctx, W / 2, 560, 230 * sp, Math.floor(t * 4) % 2 === 0)
  drawText(ctx, T.main, W / 2, 900, { family: 'Bangers', size: 170, color: INK, maxWidth: 940, alpha: prog(local, 0.8, 0.3), spacing: 6 })
  drawText(ctx, T.sub, W / 2, 1050, { family: 'Fredoka', size: 58, weight: 700, color: INK, maxWidth: 920, reveal: prog(local, 1.2, 0.9) })
  const rp = ease.outBack(prog(local, 2.2, 0.6))
  if (rp > 0) {
    ctx.save()
    ctx.translate(W / 2, 1260)
    ctx.rotate(-0.06)
    ctx.scale(rp, rp)
    ctx.fillStyle = INK
    ctx.fillRect(-400, -70, 800, 140)
    drawText(ctx, T.rip, 0, 4, { family: 'Fredoka', size: 58, weight: 700, color: YEL, maxWidth: 760 })
    ctx.restore()
  }
  ctx.restore()
}

export default {
  id: 'caution',
  name: 'Bachelor Life: Over',
  description: 'Warning signs and caution tape: single life has officially ended. Hilarious & loud.',
  music: 'bhangra',
  category: 'Funny',
  openingDuration: 4.8,
  palette: { text: INK, heading: INK, accent: '#ff3b30', soft: '#4a4a4a', card: '#ffffff', cardStroke: INK, medallion: '#fff', heart: '#ff3b30' },
  fonts: { title: 'Bangers', script: 'Bangers', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: null,
  texts: {
    deva: '',
    main: 'WARNING!',
    sub: 'Bachelor life ends soon ⚠️',
    rip: 'RIP Single Life 🪦',
    tape: 'CAUTION  •  SHAADI AHEAD  •  NO ESCAPE',
    coupleLine: 'ARE OFFICIALLY TAKEN',
    dateHeading: 'Freedom ends on',
    timePrefix: 'Point of no return:',
    eventsHeading: 'Damage schedule',
    thanks: 'Come witness it! 😂',
  },
  textLabels: [['rip', 'Funny banner'], ['tape', 'Caution tape text']],
  scenes: { opening },
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: [YEL, '#ff3b30', '#fff'],
  background(ctx) {
    ctx.fillStyle = YEL
    ctx.fillRect(0, 0, W, H)
    // diagonal hazard stripes on top & bottom edges
    ctx.save()
    for (const y of [0]) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, y, W, 70)
      ctx.clip()
      ctx.fillStyle = INK
      for (let x = -100; x < W + 100; x += 80) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 40, y)
        ctx.lineTo(x - 30, y + 70)
        ctx.lineTo(x - 70, y + 70)
        ctx.fill()
      }
      ctx.restore()
    }
    ctx.restore()
  },
  particles() {},
  foreground(ctx, t, env) {
    const T = env.theme.texts
    cautionTape(ctx, 150, -0.07, T.tape, t)
    cautionTape(ctx, H - 44, 0.03, T.tape, -t)
    emoji(ctx, '🚨', 80, 120, 60)
    emoji(ctx, '🚨', W - 80, 120, 60)
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: '#ffffff', stroke: INK, lineWidth: 12, r: 20, top: 330 })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 20, top: 330 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 50, INK, null)
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, INK, null)
  },
}
