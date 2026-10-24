import { clamp, ease, prog, rnd } from '../anim.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, perspectiveGrid, pixelHeart, scanlines, stageCard } from './kit.js'

const PX = 'Press Start 2P'
const CYAN = '#00f0ff'
const PINK = '#ff2bd6'
const YEL = '#fff200'

function opening(ctx, local, dur, env) {
  const { theme, t } = env
  const T = theme.texts
  const a = Math.min(clamp(local / 0.3), clamp((dur - local) / 0.5))
  ctx.save()
  ctx.globalAlpha *= a
  drawText(ctx, T.p1, 280, 520, { family: PX, size: 40, color: CYAN, alpha: prog(local, 0.2, 0.3), maxWidth: 440 })
  drawText(ctx, T.p2, 800, 520, { family: PX, size: 40, color: PINK, alpha: prog(local, 0.5, 0.3), maxWidth: 440 })
  for (let i = 0; i < 3; i++) if (local > 0.8 + i * 0.25) pixelHeart(ctx, 440 + i * 100, 640, 12, '#ff2b4d')
  const mp = ease.outBack(prog(local, 1.4, 0.6))
  if (mp > 0) {
    ctx.save()
    ctx.translate(W / 2, 900)
    ctx.scale(mp, mp)
    drawText(ctx, T.main, 0, 0, { family: PX, size: 92, color: YEL, maxWidth: 940, shadow: { color: PINK, blur: 0, y: 8 } })
    ctx.restore()
  }
  drawText(ctx, T.sub, W / 2, 1080, { family: PX, size: 36, color: '#fff', maxWidth: 940, reveal: prog(local, 2, 1) })
  // blinking PRESS START
  if (local > 3 && Math.floor(t * 2.5) % 2 === 0) drawText(ctx, T.start, W / 2, 1300, { family: PX, size: 44, color: CYAN, maxWidth: 900 })
  ctx.restore()
}

export default {
  id: 'arcade',
  name: 'Retro Arcade',
  description: 'Player 1 + Player 2 = co-op mode unlocked. 8-bit fonts, neon grid and pixel hearts.',
  music: 'chiptune',
  category: 'Funny',
  openingDuration: 5.2,
  palette: { text: '#e8e8ff', heading: YEL, accent: CYAN, soft: '#9aa0ff', card: 'rgba(10,0,30,.85)', cardStroke: CYAN, medallion: '#140028', heart: '#ff2b4d' },
  fonts: { title: PX, script: PX, scriptStyle: 'normal', body: 'Space Mono', deva: 'Yatra One' },
  glow: { color: PINK, blur: 0, y: 6 },
  texts: {
    deva: '',
    main: 'LEVEL UP!',
    sub: 'A NEW QUEST BEGINS',
    start: 'PRESS START',
    p1: 'PLAYER 1',
    p2: 'PLAYER 2',
    score: 'SCORE',
    hiscore: 'HI-SCORE ∞',
    amp: '+',
    coupleLine: 'CO-OP MODE UNLOCKED',
    dateHeading: 'BOSS LEVEL',
    timePrefix: 'START:',
    venueLabel: 'MAP',
    eventsHeading: 'SIDE QUESTS',
    thanks: 'GAME ON!',
  },
  textLabels: [['start', 'Blinking prompt'], ['p1', 'Player 1 label'], ['p2', 'Player 2 label'], ['score', 'Score label'], ['hiscore', 'Hi-score label']],
  scenes: { opening },
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: [CYAN, PINK, YEL],
  background(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#05001a')
    g.addColorStop(0.55, '#1a0040')
    g.addColorStop(1, '#3a0060')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 70; i++) {
      const on = Math.floor(t * 3 + i) % 4 !== 0
      if (!on) continue
      ctx.fillStyle = i % 3 ? '#fff' : CYAN
      ctx.fillRect(Math.floor(rnd(i, 1) * W / 6) * 6, Math.floor(rnd(i, 2) * H * 0.6 / 6) * 6, 6, 6)
    }
    perspectiveGrid(ctx, H * 0.68, PINK, t)
  },
  particles() {},
  foreground(ctx, t, env) {
    const T = env.theme.texts
    const score = String(Math.floor(t * 1234)).padStart(6, '0')
    drawText(ctx, `${T.score} ${score}`, 50, 70, { family: PX, size: 26, color: '#fff', align: 'left', maxWidth: 520 })
    drawText(ctx, T.hiscore, W - 50, 70, { family: PX, size: 26, color: YEL, align: 'right', maxWidth: 480 })
    for (let i = 0; i < 3; i++) pixelHeart(ctx, 70 + i * 60, 130, 6, '#ff2b4d')
    scanlines(ctx, 0.14)
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: 'rgba(10,0,30,.75)', stroke: CYAN, lineWidth: 10, r: 0, glow: CYAN })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 0 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 40, '#05001a', PINK)
  },
  coupleOverlay(ctx, local, env) {
    const T = env.theme.texts
    const p = prog(local, 1.6, 0.4)
    drawText(ctx, T.p1, 360, 300, { family: PX, size: 32, color: CYAN, alpha: p, maxWidth: 420 })
    drawText(ctx, T.p2, 720, 300, { family: PX, size: 32, color: PINK, alpha: p, maxWidth: 420 })
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, '#05001a', PINK)
  },
}
