import { ease, fadeWindow, prog, rnd } from '../anim.js'
import { formatTime, parseDate } from '../format.js'
import { roundRect, SCENES } from '../scenes.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, cloud, emoji, stageCard } from './kit.js'

const NAVY = '#14213d'
const ORANGE = '#fca311'
const MONO = 'Space Mono'

function plane(ctx, x, y, s, banner) {
  ctx.save()
  ctx.translate(x, y)
  // banner trailing behind
  if (banner) {
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(-s * 1.2, 0)
    ctx.lineTo(-s * 2, 0)
    ctx.stroke()
    ctx.font = `400 ${Math.round(s * 0.55)}px "Bebas Neue", sans-serif`
    const bw = ctx.measureText(banner).width + 60
    ctx.fillStyle = '#fff'
    ctx.fillRect(-s * 2 - bw, -s * 0.45, bw, s * 0.9)
    ctx.fillStyle = '#e63946'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(banner, -s * 2 - bw / 2, 3)
  }
  ctx.restore()
  emoji(ctx, '✈️', x, y, s * 1.6)
}

function ticket(ctx, local, dur, env) {
  const { theme, data } = env
  const T = theme.texts
  const d = parseDate(data.date)
  if (!d) return SCENES.dateVenue(ctx, local, dur, env)
  const a = fadeWindow(local, dur, 0.5, 0.6)
  const sp = ease.outBack(prog(local, 0.2, 0.8))
  ctx.save()
  ctx.globalAlpha *= a
  drawText(ctx, T.dateHeading, W / 2, 300, { family: 'Pacifico', size: 90, color: NAVY, reveal: prog(local, 0, 0.8) })
  ctx.translate(W / 2, 1000)
  ctx.rotate(-0.02)
  ctx.scale(sp, sp)
  ctx.translate(-W / 2, -1000)
  const x = 90
  const y = 420
  const w = W - 180
  const h = 1180
  ctx.shadowColor = 'rgba(0,0,0,.2)'
  ctx.shadowBlur = 30
  roundRect(ctx, x, y, w, h, 36)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  roundRect(ctx, x, y, w, 160, 36)
  ctx.fillStyle = NAVY
  ctx.fill()
  ctx.fillRect(x, y + 120, w, 40)
  drawText(ctx, T.airline, x + 50, y + 82, { family: 'Bebas Neue', size: 64, color: '#fff', align: 'left', maxWidth: w - 300, spacing: 4 })
  drawText(ctx, T.boardingPass, x + w - 50, y + 82, { family: MONO, size: 28, weight: 700, color: ORANGE, align: 'right', maxWidth: 300 })
  // FROM -> TO
  drawText(ctx, T.fromLabel, x + 60, y + 230, { family: MONO, size: 26, color: '#888', align: 'left' })
  drawText(ctx, T.toLabel, x + w - 60, y + 230, { family: MONO, size: 26, color: '#888', align: 'right' })
  drawText(ctx, T.from, x + 60, y + 310, { family: 'Bebas Neue', size: 104, color: NAVY, align: 'left', maxWidth: 360 })
  drawText(ctx, T.to, x + w - 60, y + 310, { family: 'Bebas Neue', size: 104, color: NAVY, align: 'right', maxWidth: 360 })
  emoji(ctx, '✈️', W / 2, y + 300, 80)
  const fields = [
    [T.passengersLabel, `${data.groom.name || 'Groom'} & ${data.bride.name || 'Bride'}`],
    [T.flightLabel, T.flight],
    [T.dateLabel, d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()],
    [T.boardingLabel, formatTime(data.time) || '—'],
    [T.gateLabel, [data.venue, data.address].filter(Boolean).join(', ') || '—'],
    [T.seatLabel, T.seat],
  ]
  fields.forEach(([label, value], i) => {
    const fy = y + 430 + i * 105
    const fp = prog(local, 0.8 + i * 0.15, 0.3)
    drawText(ctx, label, x + 60, fy, { family: MONO, size: 24, color: '#888', align: 'left', alpha: fp })
    drawText(ctx, value, x + 60, fy + 44, { family: MONO, size: 38, weight: 700, color: NAVY, align: 'left', maxWidth: w - 120, alpha: fp })
  })
  // perforation + barcode stub
  const py = y + h - 210
  ctx.setLineDash([14, 12])
  ctx.strokeStyle = '#bbb'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(x + 30, py)
  ctx.lineTo(x + w - 30, py)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = NAVY
  for (let i = 0, bx = x + 80; bx < x + w - 80; i++) {
    const bw = 3 + Math.floor(rnd(i, 7) * 9)
    if (i % 2 === 0) ctx.fillRect(bx, py + 50, bw, 110)
    bx += bw + 3
  }
  ctx.restore()
}

export default {
  id: 'boarding',
  name: 'Boarding Pass',
  description: 'Flight to Forever ✈ A plane trails your banner, and the date & venue arrive as a boarding pass.',
  music: 'dreamy',
  category: 'Funny',
  palette: { text: NAVY, heading: NAVY, accent: ORANGE, soft: '#4a5a7a', card: 'rgba(255,255,255,.92)', cardStroke: NAVY, medallion: '#fff', heart: '#e63946' },
  fonts: { title: 'Bebas Neue', script: 'Pacifico', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: null,
  texts: {
    deva: '',
    main: 'NOW BOARDING',
    sub: 'Flight to Forever ✈',
    airline: 'SHAADI AIRWAYS',
    boardingPass: 'BOARDING PASS',
    fromLabel: 'FROM',
    toLabel: 'TO',
    passengersLabel: 'PASSENGERS',
    flightLabel: 'FLIGHT',
    dateLabel: 'DATE',
    from: 'SINGLE',
    to: 'FOREVER',
    flight: 'LOVE 101',
    boardingLabel: 'BOARDING',
    gateLabel: 'GATE',
    seatLabel: 'SEAT',
    seat: 'ANY SEAT · ALL LOVE',
    banner: 'JUST GETTING MARRIED!',
    coupleLine: 'CLEARED FOR TAKEOFF',
    dateHeading: 'Your boarding pass',
    eventsHeading: 'Itinerary',
    thanks: "Don't miss the flight! ✈",
  },
  textLabels: [
    ['airline', 'Airline name'],
    ['boardingPass', 'Ticket label'],
    ['fromLabel', 'Label: from'],
    ['toLabel', 'Label: to'],
    ['passengersLabel', 'Label: passengers'],
    ['flightLabel', 'Label: flight'],
    ['dateLabel', 'Label: date'],
    ['from', 'From'],
    ['to', 'To'],
    ['flight', 'Flight number'],
    ['boardingLabel', 'Time label'],
    ['gateLabel', 'Venue label'],
    ['seatLabel', 'Seat label'],
    ['seat', 'Seat'],
    ['banner', 'Plane banner'],
  ],
  hideTexts: ['timePrefix', 'venueLabel'],
  scenes: { dateVenue: ticket },
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: [ORANGE, '#fff', '#e63946'],
  background(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#8ecae6')
    g.addColorStop(1, '#e0f4ff')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 7; i++) {
      const x = ((rnd(i, 1) * W + t * (20 + i * 6)) % (W + 400)) - 200
      cloud(ctx, x, 200 + rnd(i, 2) * (H - 400), 50 + rnd(i, 3) * 40, 'rgba(255,255,255,.85)')
    }
  },
  particles() {},
  foreground(ctx, t, env) {
    const cycle = 9
    const p = (t % cycle) / cycle
    const x = -500 + p * (W + 1100)
    plane(ctx, x, 150 + Math.sin(t) * 12, 60, env.theme.texts.banner)
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: '#ffffff', stroke: NAVY, lineWidth: 8, r: 120 })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 120 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 50, NAVY, ORANGE)
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, NAVY, ORANGE)
  },
}
