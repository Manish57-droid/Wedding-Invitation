import { clamp, rnd } from '../anim.js'
import { drawAvatarMedallion } from '../avatarDraw.js'
import { heart } from '../ornaments.js'
import { roundRect } from '../scenes.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, clipCard, closingBand, stageCard } from './kit.js'

function hearts(ctx, t) {
  // stream of reaction hearts rising from the bottom-right
  for (let i = 0; i < 16; i++) {
    const life = 3.2
    const tt = (t + rnd(i, 5) * life) % life
    const p = tt / life
    const x = 960 - Math.sin(p * 6 + i) * 60 - p * 120
    const y = H - 150 - p * 900
    ctx.save()
    ctx.globalAlpha = (1 - p) * 0.9
    heart(ctx, x, y, 36 + rnd(i, 6) * 30, ['#ff3b6b', '#ff7aa2', '#ffb347'][i % 3])
    ctx.restore()
  }
}

export default {
  id: 'story',
  name: 'Story Mode',
  description: 'Looks like a social media story: progress bars, a profile header, floating likes.',
  music: 'funky',
  category: 'Gen-Z',
  palette: { text: '#ffffff', heading: '#ffffff', accent: '#ffd166', soft: 'rgba(255,255,255,.85)', card: 'rgba(0,0,0,.28)', cardStroke: 'rgba(255,255,255,.6)', medallion: '#9b2c6f', heart: '#ff3b6b' },
  fonts: { title: 'Fredoka', script: 'Pacifico', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: { color: 'rgba(0,0,0,.35)', blur: 12 },
  texts: {
    deva: '',
    main: 'New post alert! 📸',
    sub: 'relationship status: getting married 💍',
    coupleLine: 'TAG YOUR SQUAD 🏷️',
    dateHeading: 'Save the date',
    timePrefix: 'Going live at',
    eventsHeading: 'Upcoming posts',
    thanks: "Double tap if you're coming ❤️",
    handle: '@our.shaadi.story',
    reply: 'Send your blessings…',
  },
  textLabels: [['handle', 'Profile name'], ['reply', 'Reply bar text']],
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: ['#ff3b6b', '#ffd166', '#fff'],
  background(ctx) {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#7f3cff')
    g.addColorStop(0.45, '#ff3b8d')
    g.addColorStop(1, '#ffb347')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  },
  particles(ctx, t) {
    hearts(ctx, t)
  },
  foreground(ctx, t, env) {
    const segs = 5
    const total = env.duration || 40
    const p = clamp(t / total) * segs
    for (let i = 0; i < segs; i++) {
      const x = 30 + i * ((W - 60) / segs)
      const w = (W - 60) / segs - 10
      ctx.fillStyle = 'rgba(255,255,255,.4)'
      roundRect(ctx, x, 30, w, 8, 4)
      ctx.fill()
      ctx.fillStyle = '#fff'
      roundRect(ctx, x, 30, w * clamp(p - i), 8, 4)
      ctx.fill()
    }
    drawAvatarMedallion(ctx, env.assets, 'bride', 90, 100, 40, { t, ring: '#fff', bg: '#ffb2c8' })
    drawText(ctx, env.theme.texts.handle, 150, 100, { family: 'Fredoka', size: 36, weight: 600, color: '#fff', align: 'left', maxWidth: 700, shadow: { color: 'rgba(0,0,0,.3)', blur: 6 } })
    // reply bar
    ctx.strokeStyle = 'rgba(255,255,255,.85)'
    ctx.lineWidth = 3
    roundRect(ctx, 40, H - 96, W - 200, 66, 33)
    ctx.stroke()
    drawText(ctx, env.theme.texts.reply, 80, H - 62, { family: 'Fredoka', size: 34, color: '#fff', align: 'left', maxWidth: W - 300 })
    heart(ctx, W - 100, H - 60, 50, '#fff')
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, { fill: 'rgba(255,255,255,.18)', stroke: '#fff', lineWidth: 6 })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom)
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 30, 'rgba(255,255,255,.9)', null)
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, 'rgba(255,255,255,.9)', null)
  },
}
