import { clamp, ease, prog } from '../anim.js'
import { roundRect } from '../scenes.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, closingBand, perspectiveGrid, stageCard, TAU } from './kit.js'

const MONO = 'Space Mono'
const WIN = '#c0c0c0'
const TITLE = '#000080'

/** A Windows-95-ish dialog box. */
function dialog(ctx, x, y, w, h, title) {
  ctx.fillStyle = WIN
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#fff'
  ctx.fillRect(x, y, w, 4)
  ctx.fillRect(x, y, 4, h)
  ctx.fillStyle = '#404040'
  ctx.fillRect(x, y + h - 4, w, 4)
  ctx.fillRect(x + w - 4, y, 4, h)
  const g = ctx.createLinearGradient(x, 0, x + w, 0)
  g.addColorStop(0, TITLE)
  g.addColorStop(1, '#1084d0')
  ctx.fillStyle = g
  ctx.fillRect(x + 8, y + 8, w - 16, 56)
  drawText(ctx, title, x + 28, y + 36, { family: MONO, size: 30, weight: 700, color: '#fff', align: 'left', maxWidth: w - 140 })
  ctx.fillStyle = WIN
  ctx.fillRect(x + w - 60, y + 16, 40, 40)
  drawText(ctx, '×', x + w - 40, y + 36, { family: MONO, size: 34, weight: 700, color: '#000', maxWidth: 40 })
}

function opening(ctx, local, dur, env) {
  const { theme } = env
  const T = theme.texts
  const a = Math.min(clamp(local / 0.3), clamp((dur - local) / 0.5))
  ctx.save()
  ctx.globalAlpha *= a
  const pop = ease.outBack(prog(local, 0.2, 0.5))
  ctx.save()
  ctx.translate(W / 2, 760)
  ctx.scale(pop, pop)
  ctx.translate(-W / 2, -760)
  dialog(ctx, 110, 500, W - 220, 560, T.file)
  const fill = ease.inOutQuad(prog(local, 0.9, 2.4))
  const done = fill >= 1
  drawText(ctx, done ? T.done : T.installing, W / 2, 660, { family: MONO, size: 38, weight: 700, color: '#000', maxWidth: W - 300 })
  // sunken progress bar with chunky blocks
  ctx.fillStyle = '#fff'
  ctx.fillRect(170, 740, W - 340, 70)
  ctx.fillStyle = '#808080'
  ctx.fillRect(170, 740, W - 340, 4)
  ctx.fillRect(170, 740, 4, 70)
  const blocks = Math.floor(fill * 18)
  ctx.fillStyle = TITLE
  for (let i = 0; i < blocks; i++) ctx.fillRect(180 + i * ((W - 360) / 18), 750, (W - 360) / 18 - 6, 50)
  drawText(ctx, `${Math.round(fill * 100)}%`, W / 2, 860, { family: MONO, size: 32, color: '#000' })
  // OK button
  ctx.fillStyle = WIN
  ctx.fillRect(W / 2 - 110, 930, 220, 80)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = done ? 4 : 2
  ctx.strokeRect(W / 2 - 110, 930, 220, 80)
  drawText(ctx, T.ok, W / 2, 970, { family: MONO, size: 34, weight: 700, color: '#000', maxWidth: 200 })
  ctx.restore()
  const tp = prog(local, 3.5, 0.6)
  drawText(ctx, T.main, W / 2, 1230, { family: 'Bungee', size: 110, color: '#fff', alpha: tp, maxWidth: 940, shadow: { color: '#ff4fd8', blur: 0, y: 8 } })
  drawText(ctx, T.sub, W / 2, 1360, { family: MONO, size: 40, color: '#fff', alpha: prog(local, 3.9, 0.6), maxWidth: 900 })
  ctx.restore()
}

export default {
  id: 'y2k',
  name: 'Y2K Vaporwave',
  description: 'wedding.exe is installing… Retro computer pop-ups, a vaporwave sun and chrome type.',
  music: 'chiptune',
  category: 'Funny',
  openingDuration: 5.6,
  palette: { text: '#ffffff', heading: '#fff', accent: '#ff4fd8', soft: '#d8f6ff', card: 'rgba(40,10,80,.55)', cardStroke: '#ffffff', medallion: '#3b1466', heart: '#ff4fd8' },
  fonts: { title: 'Bungee', script: 'Pacifico', scriptStyle: 'normal', body: MONO, deva: 'Yatra One' },
  glow: { color: '#ff4fd8', blur: 0, y: 6 },
  texts: {
    deva: '',
    file: 'wedding.exe',
    installing: 'Installing forever.exe…',
    done: 'Installation complete! 💾',
    ok: 'OK',
    startBtn: '💍 Start',
    main: 'SHAADI.EXE',
    sub: 'loading happily ever after…',
    coupleLine: 'HAVE MERGED SUCCESSFULLY',
    dateHeading: 'Scheduled update',
    timePrefix: 'Runs at',
    eventsHeading: 'Patch notes',
    thanks: 'Click OK to attend ✔',
  },
  textLabels: [['file', 'Window title'], ['installing', 'Installing text'], ['done', 'Finished text'], ['ok', 'Button'], ['startBtn', 'Taskbar button']],
  scenes: { opening },
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: ['#ff4fd8', '#00e5ff', '#fff'],
  background(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#2b1055')
    g.addColorStop(0.5, '#d53a9d')
    g.addColorStop(1, '#ffb88c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    // striped vaporwave sun
    const sy = H * 0.76
    const sg = ctx.createLinearGradient(0, sy - 300, 0, sy)
    sg.addColorStop(0, '#ffe66d')
    sg.addColorStop(1, '#ff4fd8')
    ctx.save()
    ctx.beginPath()
    ctx.arc(W / 2, sy, 260, Math.PI, TAU)
    ctx.clip()
    ctx.fillStyle = sg
    ctx.fillRect(W / 2 - 300, sy - 300, 600, 300)
    ctx.fillStyle = '#d53a9d'
    for (let i = 0; i < 6; i++) ctx.fillRect(W / 2 - 300, sy - 130 + i * 24, 600, 4 + i * 2.5)
    ctx.restore()
    ctx.fillStyle = '#1b0838'
    ctx.fillRect(0, sy, W, H - sy)
    perspectiveGrid(ctx, sy, '#00e5ff', t)
  },
  particles() {},
  foreground(ctx, t, env) {
    // taskbar
    ctx.fillStyle = WIN
    ctx.fillRect(0, H - 70, W, 70)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, H - 70, W, 3)
    ctx.fillStyle = WIN
    ctx.fillRect(12, H - 60, 170, 52)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.strokeRect(12, H - 60, 170, 52)
    drawText(ctx, env.theme.texts.startBtn, 97, H - 34, { family: MONO, size: 28, weight: 700, color: '#000', maxWidth: 160 })
    const mins = String(Math.floor(t) % 60).padStart(2, '0')
    drawText(ctx, `12:${mins} PM`, W - 110, H - 34, { family: MONO, size: 28, color: '#000', maxWidth: 200 })
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, {
      fill: (c, top, bottom) => {
        c.fillStyle = '#7fe7ff'
        c.fill()
        dialog(c, 90, top, W - 180, 70, `${env.data.groom.name || 'groom'}_${env.data.bride.name || 'bride'}.jpg`.replace(/\s+/g, '_').toLowerCase())
        void bottom
      },
      r: 0,
    })
  },
  clipStage(ctx, archBottom) {
    roundRect(ctx, 94, 316, W - 188, archBottom - 316, 0)
    ctx.clip()
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 40, WIN, '#fff')
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, WIN, '#fff')
  },
}
