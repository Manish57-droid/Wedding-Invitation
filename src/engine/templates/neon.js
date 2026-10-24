import { rnd } from '../anim.js'
import { heart } from '../ornaments.js'
import { roundRect } from '../scenes.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, flicker, neon, stageCard } from './kit.js'

const PINK = '#ff2e93'
const BLUE = '#28d7ff'

function bricks(ctx) {
  ctx.fillStyle = '#1a1214'
  ctx.fillRect(0, 0, W, H)
  const bw = 120
  const bh = 52
  for (let r = 0; r * bh < H; r++) {
    for (let c = -1; c * bw < W; c++) {
      const x = c * bw + (r % 2 ? bw / 2 : 0)
      const v = 38 + Math.floor(rnd(r * 17 + c, 2) * 18)
      ctx.fillStyle = `rgb(${v + 14},${v - 6},${v - 4})`
      ctx.fillRect(x + 3, r * bh + 3, bw - 6, bh - 6)
    }
  }
}

export default {
  id: 'neon',
  name: 'Neon Nights',
  description: 'Glowing neon signs on a brick wall, flickering just like a late-night café.',
  music: 'funky',
  category: 'Groovy',
  palette: { text: '#ffe9f4', heading: PINK, accent: BLUE, soft: '#b9c7d6', card: 'rgba(20,12,16,.82)', cardStroke: BLUE, medallion: '#1a1214', heart: PINK },
  fonts: { title: 'Bungee', script: 'Pacifico', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: { color: 'rgba(255,46,147,.9)', blur: 30 },
  texts: {
    deva: '',
    main: 'Shaadi Vibes',
    sub: "lights on, let's celebrate",
    coupleLine: 'JUST GETTING MARRIED',
    dateHeading: 'Save the Night',
    timePrefix: 'Lights on at',
    eventsHeading: 'Tonight & more',
    thanks: 'See you under the lights',
    sign: 'OPEN FOR LOVE',
  },
  textLabels: [['sign', 'Small neon sign']],
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: [PINK, BLUE, '#fff'],
  background(ctx) {
    bricks(ctx)
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.75)
    v.addColorStop(0, 'rgba(0,0,0,0)')
    v.addColorStop(1, 'rgba(0,0,0,.65)')
    ctx.fillStyle = v
    ctx.fillRect(0, 0, W, H)
  },
  particles() {},
  foreground(ctx, t, env) {
    neon(ctx, env.theme.texts.sign, W / 2, 110, { family: 'Bungee', size: 46, color: BLUE, flicker: flicker(t, 3), maxWidth: 700 })
    ctx.save()
    ctx.shadowColor = PINK
    ctx.shadowBlur = 24
    ctx.globalAlpha = flicker(t, 9)
    ctx.strokeStyle = PINK
    ctx.lineWidth = 6
    roundRect(ctx, 30, 30, W - 60, H - 60, 30)
    ctx.stroke()
    ctx.restore()
    heart(ctx, 960, 1820, 60, PINK)
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: 'rgba(10,6,8,.55)', stroke: BLUE, glow: BLUE, lineWidth: 7, r: 200 })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom, { r: 200 })
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 50, '#1a1214', PINK)
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, '#1a1214', PINK)
  },
}
