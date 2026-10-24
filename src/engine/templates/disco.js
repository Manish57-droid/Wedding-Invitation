import { rnd } from '../anim.js'
import { sparkles } from '../particles.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, rgba, stageCard, TAU } from './kit.js'

const PINK = '#ff3ea5'
const CYAN = '#2de2e6'
const GOLD = '#ffd23f'
const SPOT = [PINK, CYAN, GOLD, '#9d4dff', '#4dff88']

function discoBall(ctx, x, y, r, t) {
  // hanging wire
  ctx.strokeStyle = '#aaa'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, 0)
  ctx.lineTo(x, y - r)
  ctx.stroke()
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.clip()
  ctx.fillStyle = '#6d6d7a'
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
  const n = 10
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n * 2; i++) {
      const lon = (i / (n * 2)) * TAU + t * 0.8
      const lat = (j / n - 0.5) * Math.PI
      const cx = x + Math.sin(lon) * Math.cos(lat) * r
      const cy = y + Math.sin(lat) * r
      if (Math.cos(lon) < 0) continue
      const b = 120 + Math.floor(rnd(i * 31 + j, Math.floor(t * 6)) * 135)
      ctx.fillStyle = `rgb(${b},${b},${b + 10})`
      const s = (r / n) * 1.5 * Math.cos(lat) * Math.cos(lon) + 2
      ctx.fillRect(cx - s / 2, cy - r / n / 1.2, s, (r / n) * 1.6)
    }
  }
  ctx.restore()
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r * 2.2)
  g.addColorStop(0, 'rgba(255,255,255,.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 2.2, 0, TAU)
  ctx.fill()
}

function danceFloor(ctx, t) {
  const top = H - 170
  const rows = 5
  for (let j = 0; j < rows; j++) {
    const y0 = top + (j * 170) / rows
    const y1 = top + ((j + 1) * 170) / rows
    const w0 = 0.6 + (j / rows) * 0.6
    const w1 = 0.6 + ((j + 1) / rows) * 0.6
    for (let i = 0; i < 8; i++) {
      const on = rnd(i * 7 + j, Math.floor(t * 3)) > 0.5
      ctx.fillStyle = on ? rgba(SPOT[(i + j) % SPOT.length], 0.5) : 'rgba(40,10,60,.85)'
      const xa = W / 2 + ((i / 8 - 0.5) * W) * w0
      const xb = W / 2 + (((i + 1) / 8 - 0.5) * W) * w0
      const xc = W / 2 + (((i + 1) / 8 - 0.5) * W) * w1
      const xd = W / 2 + ((i / 8 - 0.5) * W) * w1
      ctx.beginPath()
      ctx.moveTo(xa, y0)
      ctx.lineTo(xb, y0)
      ctx.lineTo(xc, y1)
      ctx.lineTo(xd, y1)
      ctx.fill()
    }
  }
}

export default {
  id: 'disco',
  name: 'Disco Shaadi',
  description: 'Mirror ball, flashing dance floor and sweeping party lights. Nachna compulsory!',
  music: 'funky',
  category: 'Groovy',
  palette: { text: '#f4e9ff', heading: GOLD, accent: PINK, soft: '#c7b3ff', card: 'rgba(30,8,50,.8)', cardStroke: CYAN, medallion: '#1e0832', heart: PINK },
  fonts: { title: 'Bungee', script: 'Pacifico', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: { color: 'rgba(255,62,165,.7)', blur: 26 },
  texts: {
    deva: '',
    main: "LET'S DISCO!",
    sub: 'Shaadi pe nachna compulsory hai 🕺💃',
    coupleLine: 'ARE GETTING HITCHED',
    dateHeading: 'Party Date',
    timePrefix: 'DJ starts at',
    eventsHeading: 'Party Line-up',
    thanks: 'See you on the dance floor!',
  },
  emblem: 'heart',
  coupleEffect: 'fireworks',
  garland: [PINK, GOLD, CYAN],
  background(ctx, t) {
    const g = ctx.createRadialGradient(W / 2, H * 0.3, 50, W / 2, H * 0.5, H)
    g.addColorStop(0, '#3b0a5e')
    g.addColorStop(1, '#0c0218')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    // sweeping coloured light spots
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 9; i++) {
      const x = W / 2 + Math.sin(t * (0.5 + i * 0.13) + i * 2) * W * 0.55
      const y = H * 0.5 + Math.cos(t * (0.4 + i * 0.11) + i) * H * 0.45
      const sg = ctx.createRadialGradient(x, y, 0, x, y, 170)
      sg.addColorStop(0, rgba(SPOT[i % SPOT.length], 0.35))
      sg.addColorStop(1, rgba(SPOT[i % SPOT.length], 0))
      ctx.fillStyle = sg
      ctx.fillRect(x - 170, y - 170, 340, 340)
    }
    ctx.restore()
    danceFloor(ctx, t)
  },
  particles(ctx, t) {
    sparkles(ctx, t, W, H, { count: 50, color: '#ffffff' })
  },
  foreground(ctx, t) {
    discoBall(ctx, W / 2, 120, 70, t)
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: 'rgba(20,4,40,.7)', stroke: PINK, glow: PINK, lineWidth: 8 })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom)
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 56, '#1e0832', CYAN)
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, '#1e0832', CYAN)
  },
}
