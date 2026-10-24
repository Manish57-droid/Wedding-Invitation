import { H, W } from './base.js'
import { band, clipCard, closingBand, daisy, stageCard, TAU } from './kit.js'

const COLORS = ['#e8702a', '#f2b134', '#6b3e26', '#e5989b', '#3d8b7d']
// lighter tints for the background rings so text stays readable
const RINGS = ['#f6b98f', '#f8d78f', '#e9b8a6', '#f2c4c6', '#a9d3c9']
const CREAM = '#fbecd0'

/** Concentric wobbly rings, like a 70s poster. */
function rings(ctx, cx, cy, t) {
  for (let i = 14; i >= 1; i--) {
    const R = i * 120
    ctx.fillStyle = i % 2 ? RINGS[(i >> 1) % RINGS.length] : CREAM
    ctx.beginPath()
    for (let k = 0; k <= 120; k++) {
      const a = (k / 120) * TAU
      const r = R + Math.sin(a * 6 + t * 1.2 + i) * 14
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    }
    ctx.fill()
  }
}

export default {
  id: 'groovy',
  name: 'Groovy 70s',
  description: 'Peace, love & shaadi: wavy retro rings, spinning daisies and funky type.',
  music: 'funky',
  category: 'Groovy',
  palette: { text: '#4a2614', heading: '#6b3e26', accent: '#e8702a', soft: '#8a5a3c', card: 'rgba(251,236,208,.94)', cardStroke: '#6b3e26', medallion: CREAM, heart: '#e5989b' },
  fonts: { title: 'Shrikhand', script: 'Shrikhand', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: null,
  texts: {
    deva: '',
    main: 'Groovy Love',
    sub: 'peace, love & shaadi ✌️',
    coupleLine: 'ARE TYING THE KNOT',
    dateHeading: 'Save the groovy date',
    timePrefix: 'Party starts',
    eventsHeading: 'Far-out Line-up',
    thanks: 'Stay groovy, baby!',
  },
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: COLORS,
  background(ctx, t) {
    ctx.fillStyle = CREAM
    ctx.fillRect(0, 0, W, H)
    ctx.save()
    ctx.globalAlpha = 0.5
    rings(ctx, W / 2, H * 0.45, t)
    ctx.restore()
  },
  particles() {},
  foreground(ctx, t) {
    const spots = [[90, 120, 60], [990, 200, 48], [70, 1820, 52], [1000, 1760, 64], [540, 60, 34]]
    spots.forEach(([x, y, r], i) => daisy(ctx, x, y + Math.sin(t * 2 + i) * 6, r, t * (i % 2 ? 0.8 : -0.8), '#fff', COLORS[i % 2]))
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, {
      fill: (c, _top, bottom) => {
        c.save()
        c.clip()
        // 70s rainbow arch inside the card
        for (let i = 0; i < 5; i++) {
          c.fillStyle = COLORS[i]
          c.beginPath()
          c.arc(W / 2, bottom, 520 - i * 70, Math.PI, 0)
          c.fill()
        }
        c.restore()
      },
      stroke: '#6b3e26',
      lineWidth: 10,
      r: 240,
    })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 240 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 60, '#6b3e26', '#f2b134')
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, '#6b3e26', '#f2b134')
  },
}
