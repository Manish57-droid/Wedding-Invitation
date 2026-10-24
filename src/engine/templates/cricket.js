import { clamp, ease, fadeWindow, prog, rnd } from '../anim.js'
import { formatTime, parseDate } from '../format.js'
import { roundRect, SCENES } from '../scenes.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, emoji, stageCard, TAU } from './kit.js'

const GREEN = '#2d6a2e'
const LED = '#ffcc00'
const BOARD = '#0d0d0d'

function stadium(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#061a33')
  g.addColorStop(0.5, '#0b2f52')
  g.addColorStop(1, '#0a2a1a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // crowd: many tiny flickering dots in the stands
  for (let i = 0; i < 380; i++) {
    const x = rnd(i, 1) * W
    const y = 420 + rnd(i, 2) * 420
    const on = rnd(i, Math.floor(t * 4)) > 0.2
    ctx.fillStyle = on ? ['#ff4d6d', '#ffd166', '#4cc9f0', '#fff', '#80ed99'][i % 5] : '#223'
    ctx.fillRect(x, y, 6, 6)
  }
  // field
  ctx.fillStyle = GREEN
  ctx.beginPath()
  ctx.ellipse(W / 2, H + 200, W * 0.95, 1000, 0, Math.PI, TAU)
  ctx.fill()
  // pitch in perspective
  ctx.fillStyle = 'rgba(201,179,126,.8)'
  ctx.beginPath()
  ctx.moveTo(W / 2 - 40, 1500)
  ctx.lineTo(W / 2 + 40, 1500)
  ctx.lineTo(W / 2 + 110, H)
  ctx.lineTo(W / 2 - 110, H)
  ctx.fill()
  // floodlights
  for (const x of [80, W - 80]) {
    ctx.fillStyle = '#334'
    ctx.fillRect(x - 6, 120, 12, 360)
    ctx.fillStyle = '#fff'
    ctx.fillRect(x - 60, 90, 120, 60)
    const fl = ctx.createRadialGradient(x, 120, 0, x, 120, 380)
    fl.addColorStop(0, 'rgba(255,255,230,.6)')
    fl.addColorStop(1, 'rgba(255,255,230,0)')
    ctx.fillStyle = fl
    ctx.fillRect(x - 380, 0, 760, 500)
  }
}

function stumps(ctx, x, y, s) {
  ctx.fillStyle = '#f2e3c0'
  for (let i = -1; i <= 1; i++) ctx.fillRect(x + i * s * 0.35 - s * 0.06, y - s * 1.6, s * 0.12, s * 1.6)
  ctx.fillStyle = '#e63946'
  ctx.fillRect(x - s * 0.45, y - s * 1.66, s * 0.4, s * 0.08)
  ctx.fillRect(x + s * 0.05, y - s * 1.66, s * 0.4, s * 0.08)
}

function opening(ctx, local, dur, env) {
  const { theme, t } = env
  const T = theme.texts
  const a = Math.min(clamp(local / 0.3), clamp((dur - local) / 0.5))
  ctx.save()
  ctx.globalAlpha *= a
  // ball flies towards the camera
  const bp = prog(local, 0, 1)
  if (bp < 1) emoji(ctx, '🏏', W / 2 + Math.sin(bp * 6) * 60, 700, 40 + bp * 300, 1 - bp * 0.4)
  const mp = ease.outBack(prog(local, 0.9, 0.6))
  if (mp > 0) {
    ctx.save()
    ctx.translate(W / 2, 760)
    ctx.scale(mp, mp)
    drawText(ctx, T.main, 0, 0, { family: 'Bangers', size: 190, color: LED, maxWidth: 940, stroke: { color: '#000', width: 10 }, spacing: 6 })
    ctx.restore()
  }
  drawText(ctx, T.sub, W / 2, 940, { family: 'Fredoka', size: 52, weight: 700, color: '#fff', maxWidth: 920, reveal: prog(local, 1.5, 0.9) })
  const vp = ease.outBack(prog(local, 2.2, 0.6))
  if (vp > 0) {
    ctx.save()
    ctx.translate(W / 2, 1160)
    ctx.scale(vp, vp)
    drawText(ctx, T.teamA, -250, 0, { family: 'Bebas Neue', size: 80, color: '#4cc9f0', maxWidth: 400 })
    drawText(ctx, T.vs, 0, 0, { family: 'Bangers', size: 90, color: LED, maxWidth: 140 })
    drawText(ctx, T.teamB, 250, 0, { family: 'Bebas Neue', size: 80, color: '#ff4d6d', maxWidth: 400 })
    ctx.restore()
  }
  void t
  ctx.restore()
}

function scoreboard(ctx, local, dur, env) {
  const { theme, data } = env
  const T = theme.texts
  const d = parseDate(data.date)
  if (!d) return SCENES.dateVenue(ctx, local, dur, env)
  const a = fadeWindow(local, dur, 0.5, 0.6)
  ctx.save()
  ctx.globalAlpha *= a
  const x = 80
  const y = 300
  const w = W - 160
  roundRect(ctx, x - 16, y - 16, w + 32, 1180, 30)
  ctx.fillStyle = '#3a3a3a'
  ctx.fill()
  roundRect(ctx, x, y, w, 1148, 20)
  ctx.fillStyle = BOARD
  ctx.fill()
  drawText(ctx, T.dateHeading.toUpperCase(), W / 2, y + 80, { family: 'Bebas Neue', size: 70, color: LED, maxWidth: w - 80, spacing: 6 })
  ctx.fillStyle = '#333'
  ctx.fillRect(x + 40, y + 140, w - 80, 4)
  const rows = [
    [T.match, T.matchName],
    [T.teamsLabel, `${T.teamA} ${T.vs} ${T.teamB}`],
    [T.dateLabel, d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()],
    [T.toss, formatTime(data.time) || '—'],
    [T.ground, (data.venue || '—').toUpperCase()],
    ['', (data.address || '').toUpperCase()],
  ]
  rows.forEach(([label, value], i) => {
    const ry = y + 230 + i * 150
    const rp = prog(local, 0.4 + i * 0.25, 0.25)
    // LED rows "type" on
    drawText(ctx, label, x + 50, ry, { family: 'Bebas Neue', size: 46, color: '#9aa', align: 'left', alpha: rp, maxWidth: 300 })
    drawText(ctx, value, x + w - 50, ry, { family: 'Bebas Neue', size: 60, color: LED, align: 'right', maxWidth: w - 400, reveal: rp, shadow: { color: 'rgba(255,204,0,.6)', blur: 14 } })
  })
  stumps(ctx, W / 2, y + 1120, 60)
  ctx.restore()
}

export default {
  id: 'cricket',
  name: 'Cricket Match Day',
  description: 'Team Groom vs Team Bride! Stadium floodlights, cheering crowd and an LED scoreboard.',
  music: 'bhangra',
  category: 'Funny',
  openingDuration: 4.6,
  palette: { text: '#ffffff', heading: LED, accent: '#4cc9f0', soft: '#cfe3d0', card: 'rgba(10,20,30,.85)', cardStroke: LED, medallion: '#0b2f52', heart: '#ff4d6d' },
  fonts: { title: 'Bebas Neue', script: 'Bangers', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: { color: 'rgba(0,0,0,.6)', blur: 10 },
  texts: {
    deva: '',
    main: 'MATCH DAY!',
    sub: 'The partnership of the century 🏏',
    teamA: 'TEAM GROOM',
    teamB: 'TEAM BRIDE',
    vs: 'VS',
    teamsLabel: 'TEAMS',
    match: 'MATCH',
    matchName: 'THE BIG SHAADI FINAL',
    dateLabel: 'DATE',
    toss: 'TOSS AT',
    ground: 'STADIUM',
    coupleLine: 'THE PERFECT PARTNERSHIP',
    dateHeading: 'Match details',
    eventsHeading: 'Tournament fixtures',
    thanks: 'Be in the stands! 🏏',
  },
  textLabels: [
    ['teamA', 'Team 1'],
    ['teamB', 'Team 2'],
    ['vs', 'Versus'],
    ['teamsLabel', 'Scoreboard: teams label'],
    ['match', 'Scoreboard: match label'],
    ['matchName', 'Scoreboard: match name'],
    ['dateLabel', 'Scoreboard: date label'],
    ['toss', 'Scoreboard: time label'],
    ['ground', 'Scoreboard: venue label'],
  ],
  hideTexts: ['timePrefix', 'venueLabel'],
  scenes: { opening, dateVenue: scoreboard },
  emblem: 'heart',
  coupleEffect: 'fireworks',
  garland: ['#ff4d6d', LED, '#4cc9f0'],
  background(ctx, t) {
    stadium(ctx, t)
  },
  particles() {},
  foreground() {},
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: 'rgba(45,106,46,.85)', stroke: LED, lineWidth: 8, r: 30 })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 30 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 50, BOARD, LED)
  },
  coupleOverlay(ctx, local, env) {
    const T = env.theme.texts
    const p = prog(local, 1.6, 0.4)
    drawText(ctx, T.teamA, 360, 310, { family: 'Bebas Neue', size: 50, color: '#4cc9f0', alpha: p, maxWidth: 400, shadow: { color: '#000', blur: 8 } })
    drawText(ctx, T.teamB, 720, 310, { family: 'Bebas Neue', size: 50, color: '#ff4d6d', alpha: p, maxWidth: 400, shadow: { color: '#000', blur: 8 } })
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, BOARD, LED)
  },
}
