import { clamp, ease, prog } from '../anim.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, stageCard, TAU } from './kit.js'

const RED = '#d90429'
const NAVY = '#0b1d3a'
const BEBAS = 'Bebas Neue'

function ticker(ctx, label, text, t) {
  const y = H - 84
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, y, W, 70)
  ctx.fillStyle = RED
  ctx.fillRect(0, y, 190, 70)
  drawText(ctx, label, 95, y + 37, { family: BEBAS, size: 54, color: '#fff', maxWidth: 170 })
  ctx.save()
  ctx.beginPath()
  ctx.rect(190, y, W - 190, 70)
  ctx.clip()
  ctx.font = `400 48px "${BEBAS}", sans-serif`
  ctx.fillStyle = NAVY
  ctx.textBaseline = 'middle'
  const unit = `${text}   •   `
  const uw = ctx.measureText(unit).width || 1
  const off = (t * 160) % uw
  for (let x = 200 - off; x < W; x += uw) ctx.fillText(unit, x, y + 39)
  ctx.restore()
}

function globe(ctx, x, y, r, t) {
  ctx.save()
  ctx.strokeStyle = 'rgba(120,170,255,.25)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.stroke()
  for (let i = 0; i < 8; i++) {
    const k = Math.cos(((i / 8) * Math.PI + t * 0.4) % Math.PI)
    ctx.beginPath()
    ctx.ellipse(x, y, Math.abs(k) * r, r, 0, 0, TAU)
    ctx.stroke()
  }
  for (let j = -3; j <= 3; j++) {
    const yy = y + (j / 4) * r
    const ww = Math.sqrt(1 - (j / 4) ** 2) * r
    ctx.beginPath()
    ctx.moveTo(x - ww, yy)
    ctx.lineTo(x + ww, yy)
    ctx.stroke()
  }
  ctx.restore()
}

function opening(ctx, local, dur, env) {
  const { theme, t } = env
  const T = theme.texts
  const a = Math.min(clamp(local / 0.2), clamp((dur - local) / 0.5))
  ctx.save()
  ctx.globalAlpha *= a
  // BREAKING NEWS slams in with a spin
  const sp = ease.outBack(prog(local, 0.1, 0.7))
  ctx.save()
  ctx.translate(W / 2, 640)
  ctx.rotate((1 - sp) * -1.2)
  ctx.scale(sp, sp)
  ctx.fillStyle = RED
  ctx.fillRect(-470, -110, 940, 220)
  ctx.fillStyle = '#fff'
  ctx.fillRect(-470, 70, 940, 40)
  drawText(ctx, T.breaking, 0, -16, { family: BEBAS, size: 170, color: '#fff', maxWidth: 900, spacing: 4 })
  drawText(ctx, T.exclusive, 0, 90, { family: BEBAS, size: 36, color: RED, maxWidth: 900, spacing: 8 })
  ctx.restore()
  const hp = prog(local, 1.1, 0.5)
  if (hp > 0) {
    ctx.fillStyle = 'rgba(255,255,255,.95)'
    ctx.fillRect(60, 900, (W - 120) * ease.outCubic(hp), 230)
    drawText(ctx, T.main, W / 2, 970, { family: BEBAS, size: 96, color: NAVY, maxWidth: 900, alpha: prog(local, 1.4, 0.3) })
    drawText(ctx, T.sub, W / 2, 1070, { family: 'Poppins', size: 40, weight: 600, color: RED, maxWidth: 900, alpha: prog(local, 1.7, 0.3) })
  }
  void t
  ctx.restore()
}

export default {
  id: 'news',
  name: 'Breaking News',
  description: 'Shaadi makes headlines: red news banners, a LIVE badge and a funny scrolling ticker.',
  music: 'funky',
  category: 'Funny',
  openingDuration: 4.6,
  palette: { text: '#eef3ff', heading: '#ffffff', accent: RED, soft: '#a9bde0', card: 'rgba(11,29,58,.88)', cardStroke: RED, medallion: NAVY, heart: RED },
  fonts: { title: BEBAS, script: BEBAS, scriptStyle: 'normal', body: 'Poppins', deva: 'Yatra One' },
  glow: null,
  texts: {
    deva: '',
    breaking: 'BREAKING NEWS',
    exclusive: 'EXCLUSIVE REPORT',
    live: 'LIVE',
    tickerLabel: 'NEWS',
    main: "THEY'RE GETTING MARRIED!",
    sub: "Sources confirm: it's official 💍",
    ticker: 'Mithai stocks surge  •  Relatives cancel all other plans  •  Dance floor on high alert  •  DJ officially booked  •  Aunties preparing questions',
    coupleLine: 'EXCLUSIVE: COUPLE CONFIRMS SHAADI',
    dateHeading: 'Mark your calendar',
    timePrefix: 'Live from',
    eventsHeading: 'Coverage schedule',
    thanks: 'Stay tuned. Be there!',
  },
  textLabels: [['breaking', 'Banner'], ['exclusive', 'Banner subtitle'], ['live', 'Live badge'], ['tickerLabel', 'Ticker label'], ['ticker', 'Scrolling ticker']],
  scenes: { opening },
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: [RED, '#fff', '#ffd166'],
  background(ctx, t) {
    const g = ctx.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H * 0.5, H)
    g.addColorStop(0, '#1b3a6b')
    g.addColorStop(1, '#050d1c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    globe(ctx, W / 2, H * 0.42, 520, t)
  },
  particles() {},
  foreground(ctx, t, env) {
    const T = env.theme.texts
    // blinking LIVE badge + clock
    ctx.fillStyle = RED
    ctx.fillRect(50, 60, 170, 70)
    ctx.fillStyle = Math.floor(t * 2) % 2 ? '#fff' : RED
    ctx.beginPath()
    ctx.arc(85, 95, 12, 0, TAU)
    ctx.fill()
    drawText(ctx, T.live, 145, 98, { family: BEBAS, size: 52, color: '#fff', maxWidth: 110 })
    const secs = String(Math.floor(t) % 60).padStart(2, '0')
    drawText(ctx, `19:${secs} IST`, W - 60, 98, { family: BEBAS, size: 48, color: '#fff', align: 'right', maxWidth: 300 })
    ticker(ctx, T.tickerLabel, T.ticker, t)
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: '#2a5298', stroke: '#fff', lineWidth: 6, r: 12 })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 12 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 50, RED, '#fff')
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, RED, '#fff')
  },
}
