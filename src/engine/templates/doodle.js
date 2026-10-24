import { rgba, shade } from '../../lib/color.js'
import { ease, fadeWindow, prog, rnd } from '../anim.js'
import { doodleArrow, doodleCircle, doodleHeart, doodleStar, squiggle, washiTape } from '../doodle.js'
import { formatTime, parseDate } from '../format.js'
import { confetti } from '../particles.js'
import { SCENES, roundRect } from '../scenes.js'
import { drawParagraph, drawText } from '../text.js'
import { H, W } from './base.js'

const INK = '#2b2b2b'
const RED = '#e63946'
const PINK = '#ff70a6'
const YELLOW = '#ffbe0b'
const BLUE = '#3a86ff'
const PAPER = '#fdf8ef'

// photo area of the polaroid that frames the couple
const PHOTO = { x: 150, y: 300, w: 780 }

function paper(ctx) {
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)
  // dotted notebook grid
  ctx.fillStyle = 'rgba(58,134,255,.16)'
  for (let y = 40; y < H; y += 48) for (let x = 36; x < W; x += 48) ctx.fillRect(x, y, 3, 3)
}

/** Static doodles around the edges, boiling gently. */
const EDGE_DOODLES = [
  ['heart', 120, 170, 34, RED], ['star', 960, 150, 30, YELLOW], ['heart', 980, 1760, 30, PINK],
  ['star', 90, 1790, 26, BLUE], ['heart', 70, 980, 22, PINK], ['star', 1010, 900, 22, RED],
]

function envelope(ctx, local) {
  // closed envelope that opens and drops away to reveal the card
  const open = ease.inOutCubic(prog(local, 0.2, 0.8))
  const drop = ease.inQuad(prog(local, 1, 0.9))
  if (drop >= 1) return
  const ex = 110
  const ew = W - 220
  const ey = 640 + drop * 1500
  const eh = 640
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,.12)'
  roundRect(ctx, ex + 10, ey + 16, ew, eh, 18)
  ctx.fill()
  ctx.fillStyle = '#f3c5c5'
  roundRect(ctx, ex, ey, ew, eh, 18)
  ctx.fill()
  // card peeking out
  if (open > 0.5) {
    ctx.fillStyle = '#fff'
    ctx.fillRect(ex + 60, ey - 160 * (open - 0.5) * 2, ew - 120, 200)
  }
  // bottom flaps
  ctx.fillStyle = '#eeb1b1'
  ctx.beginPath()
  ctx.moveTo(ex, ey + eh)
  ctx.lineTo(W / 2, ey + eh * 0.5)
  ctx.lineTo(ex + ew, ey + eh)
  ctx.closePath()
  ctx.fill()
  // top flap folding open
  ctx.fillStyle = '#e89a9a'
  ctx.beginPath()
  ctx.moveTo(ex, ey)
  ctx.lineTo(W / 2, ey + eh * 0.55 * (1 - open * 2))
  ctx.lineTo(ex + ew, ey)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 4
  roundRect(ctx, ex, ey, ew, eh, 18)
  ctx.stroke()
  // wax-seal heart
  if (open < 0.3) {
    ctx.beginPath()
    ctx.arc(W / 2, ey + eh * 0.5, 64, 0, Math.PI * 2)
    ctx.fillStyle = RED
    ctx.fill()
    doodleHeart(ctx, W / 2, ey + eh * 0.5 + 4, 34, { color: '#fff', width: 5, t: local })
  }
  ctx.restore()
}

function calendar(ctx, local, dur, env) {
  const { theme, data, t } = env
  const d = parseDate(data.date)
  if (!d) return SCENES.dateVenue(ctx, local, dur, env)
  const F = theme.fonts
  const P = theme.palette
  const a = fadeWindow(local, dur, 0.5, 0.6)
  const pop = ease.outBack(prog(local, 0.1, 0.8))
  ctx.save()
  ctx.globalAlpha *= a

  drawText(ctx, theme.texts.dateHeading, W / 2, 230, { family: F.script, size: 120, weight: 700, color: P.heading, reveal: prog(local, 0, 0.8) })
  squiggle(ctx, W / 2 - 200, 300, 400, { p: prog(local, 0.5, 0.6), t, color: P.accent, width: 5 })

  // calendar card
  const cx = 120
  const cy = 380
  const cw = W - 240
  const ch = 900
  ctx.save()
  ctx.translate(W / 2, cy + ch / 2)
  ctx.rotate(-0.02)
  ctx.scale(pop, pop)
  ctx.translate(-W / 2, -(cy + ch / 2))
  ctx.fillStyle = 'rgba(0,0,0,.1)'
  roundRect(ctx, cx + 12, cy + 16, cw, ch, 24)
  ctx.fill()
  ctx.fillStyle = '#fff'
  roundRect(ctx, cx, cy, cw, ch, 24)
  ctx.fill()
  ctx.fillStyle = RED
  roundRect(ctx, cx, cy, cw, 170, 24)
  ctx.fill()
  ctx.fillRect(cx, cy + 120, cw, 50)
  ctx.strokeStyle = INK
  ctx.lineWidth = 4
  roundRect(ctx, cx, cy, cw, ch, 24)
  ctx.stroke()
  // spiral rings
  for (let i = 0; i < 9; i++) {
    const rx = cx + 70 + i * ((cw - 140) / 8)
    ctx.fillStyle = PAPER
    ctx.beginPath()
    ctx.arc(rx, cy + 26, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = INK
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(rx, cy + 4, 16, Math.PI * 0.15, Math.PI * 0.85, true)
    ctx.stroke()
  }
  const month = d.toLocaleDateString('en-IN', { month: 'long' })
  drawText(ctx, `${month} ${d.getFullYear()}`, W / 2, cy + 98, { family: F.script, size: 92, weight: 700, color: '#fff' })

  const gx = cx + 40
  const cellW = (cw - 80) / 7
  ;['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((l, i) => drawText(ctx, l, gx + cellW * (i + 0.5), cy + 220, { family: F.title, size: 44, color: i === 0 ? RED : '#888' }))
  const first = new Date(d.getFullYear(), d.getMonth(), 1).getDay()
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const rows = Math.ceil((first + days) / 7)
  const cellH = Math.min(110, (ch - 280) / rows)
  let target = null
  for (let day = 1; day <= days; day++) {
    const idx = first + day - 1
    const col = idx % 7
    const row = Math.floor(idx / 7)
    const x = gx + cellW * (col + 0.5)
    const y = cy + 300 + row * cellH
    const isDay = day === d.getDate()
    if (isDay) target = [x, y]
    const appear = prog(local, 0.4 + idx * 0.012, 0.3)
    drawText(ctx, String(day), x, y, { family: F.title, size: isDay ? 58 : 46, color: isDay ? RED : col === 0 ? shade(RED, 0.3) : INK, alpha: appear })
  }
  if (target) {
    const hp = prog(local, 1.4, 1)
    doodleHeart(ctx, target[0], target[1] + 6, 62, { p: hp, t, color: RED, width: 6, seed: 3 })
    doodleCircle(ctx, target[0], target[1] + 4, 78, 70, { p: prog(local, 2.1, 0.7), t, color: RED, width: 3, seed: 9, amp: 4 })
    const ap = prog(local, 2.6, 0.6)
    if (ap > 0) {
      const fromRight = target[0] < W / 2
      const ax = fromRight ? target[0] + 260 : target[0] - 260
      const ay = Math.min(cy + ch - 60, target[1] + 230)
      doodleArrow(ctx, ax, ay, target[0] + (fromRight ? 70 : -70), target[1] + 60, fromRight ? -60 : 60, { p: ap, t, color: INK, width: 5, seed: 4 })
      drawText(ctx, theme.texts.bigDay, ax, ay + 40, { family: F.script, size: 58, weight: 700, color: BLUE, alpha: ap, maxWidth: 380 })
    }
  }
  ctx.restore()

  // time + venue
  const vp = prog(local, 2.2, 0.8)
  let y = 1380
  if (data.time) {
    drawText(ctx, [theme.texts.timePrefix, formatTime(data.time)].filter(Boolean).join(' '), W / 2, y, { family: F.script, size: 74, weight: 700, color: INK, alpha: vp })
    y += 100
  }
  if (data.venue || data.address) {
    // pin doodle
    ctx.save()
    ctx.globalAlpha *= vp
    ctx.fillStyle = RED
    ctx.beginPath()
    ctx.arc(W / 2, y - 6, 26, Math.PI, 0)
    ctx.quadraticCurveTo(W / 2 + 26, y + 20, W / 2, y + 44)
    ctx.quadraticCurveTo(W / 2 - 26, y + 20, W / 2 - 26, y - 6)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(W / 2, y - 6, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    y = drawParagraph(ctx, data.venue || '', W / 2, y + 100, { family: F.title, size: 56, color: INK, maxWidth: 820, alpha: vp })
    drawParagraph(ctx, data.address || '', W / 2, y, { family: F.title, size: 42, color: '#666', maxWidth: 820, alpha: vp })
  }
  ctx.restore()
}

export default {
  id: 'doodle',
  name: 'Doodle Calendar',
  description: 'Playful hand-drawn card: envelope opens, a heart gets scribbled around your date on the calendar.',
  music: 'bhangra',
  openingDuration: 5.4,
  palette: {
    text: '#3a3a3a',
    heading: RED,
    accent: BLUE,
    soft: '#7a7a7a',
    card: 'rgba(255,255,255,.92)',
    cardStroke: INK,
    medallion: '#ffffff',
    heart: RED,
  },
  fonts: { title: 'Patrick Hand', script: 'Caveat', scriptStyle: 'normal', body: 'Patrick Hand', deva: 'Yatra One' },
  glow: null,
  texts: {
    deva: '',
    main: "We're getting married!",
    sub: 'and you are invited to the party',
    timePrefix: 'from',
    eventsHeading: 'The Plan',
    thanks: 'Can’t wait to see you!',
    bigDay: 'our big day!',
  },
  textLabels: [['bigDay', 'Calendar arrow note']],
  emblem: 'kalash',
  coupleEffect: 'hearts',
  emblemColor: '#e0a526',
  garland: [RED, PINK, YELLOW],
  scenes: { dateVenue: calendar },

  background(ctx) {
    paper(ctx)
  },
  particles(ctx, t) {
    confetti(ctx, t, W, H, { count: 26, alpha: 0.85 })
  },
  foreground(ctx, t) {
    EDGE_DOODLES.forEach(([kind, x, y, s, c], i) => {
      const bob = Math.sin(t * 2 + i) * 6
      if (kind === 'heart') doodleHeart(ctx, x, y + bob, s, { t, color: c, width: 5, seed: i, fill: rgba(c, 0.25) })
      else doodleStar(ctx, x, y + bob, s, { t, color: c, width: 5, seed: i, fill: rgba(c, 0.3) })
    })
  },
  openingOverlay(ctx, local) {
    if (local > 2.2) return
    // the opening scene starts once the envelope has dropped away
    envelope(ctx, Math.max(local, 0))
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    const p = ease.outBack(prog(local, 0, 0.7))
    if (p <= 0) return
    ctx.save()
    ctx.translate(W / 2, archBottom)
    ctx.rotate(0.015)
    ctx.scale(p, p)
    ctx.translate(-W / 2, -archBottom)
    const top = PHOTO.y - 40
    ctx.fillStyle = 'rgba(0,0,0,.12)'
    ctx.fillRect(PHOTO.x - 40 + 14, top + 18, PHOTO.w + 80, archBottom - top + 60)
    ctx.fillStyle = '#fff'
    ctx.fillRect(PHOTO.x - 40, top, PHOTO.w + 80, archBottom - top + 60)
    ctx.strokeStyle = INK
    ctx.lineWidth = 4
    ctx.strokeRect(PHOTO.x - 40, top, PHOTO.w + 80, archBottom - top + 60)
    ctx.fillStyle = '#ffd6e0'
    ctx.fillRect(PHOTO.x, PHOTO.y, PHOTO.w, archBottom - PHOTO.y)
    for (let i = 0; i < 14; i++) {
      doodleHeart(ctx, PHOTO.x + 50 + rnd(i, 4) * (PHOTO.w - 100), PHOTO.y + 50 + rnd(i, 5) * (archBottom - PHOTO.y - 200), 18 + rnd(i, 6) * 14, { t: env.t, color: rgba('#ffffff', 0.9), width: 4, seed: i })
    }
    ctx.restore()
  },
  clipStage(ctx, archBottom) {
    ctx.beginPath()
    ctx.rect(PHOTO.x, PHOTO.y, PHOTO.w, archBottom - PHOTO.y)
    ctx.clip()
  },
  stageFront(ctx, archBottom, t) {
    washiTape(ctx, PHOTO.x, PHOTO.y - 30, 220, 56, -0.6, YELLOW)
    washiTape(ctx, PHOTO.x + PHOTO.w, PHOTO.y - 30, 220, 56, 0.6, PINK)
    doodleHeart(ctx, W / 2, archBottom + 30, 22, { t, color: RED, width: 5, fill: rgba(RED, 0.8) })
  },
  closingBase(ctx, y, t) {
    ctx.fillStyle = PAPER
    ctx.fillRect(W / 2 - 320, y, 640, 60)
    squiggle(ctx, W / 2 - 300, y + 10, 600, { t, color: RED, width: 6 })
  },
}
