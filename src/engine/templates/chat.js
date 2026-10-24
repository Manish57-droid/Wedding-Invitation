import { clamp, prog } from '../anim.js'
import { roundRect } from '../scenes.js'
import { drawText } from '../text.js'
import { H, W } from './base.js'
import { band, chatBubble, clipCard, closingBand, emoji, emojiFloat, stageCard, typingDots } from './kit.js'

const PURPLE = '#7b5cff'
const WALL = '#efeaff'

// [text key, side]: -1 = the couple (left), 1 = friends (right)
const THREAD = [
  ['chat1', -1],
  ['chat2', 1],
  ['chat3', -1],
  ['chat4', 1],
  ['chat5', 1],
  ['chat6', -1],
]
const STEP = 1.05

function header(ctx, theme) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, 190)
  ctx.fillStyle = 'rgba(0,0,0,.06)'
  ctx.fillRect(0, 190, W, 4)
  ctx.beginPath()
  ctx.arc(120, 105, 50, 0, Math.PI * 2)
  ctx.fillStyle = PURPLE
  ctx.fill()
  emoji(ctx, '💍', 120, 108, 54)
  drawText(ctx, theme.texts.group, 200, 88, { family: 'Fredoka', size: 46, weight: 600, color: '#222', align: 'left', maxWidth: 760 })
  drawText(ctx, theme.texts.members, 200, 138, { family: 'Fredoka', size: 32, color: '#8a8a8a', align: 'left', maxWidth: 760 })
}

function opening(ctx, local, dur, env) {
  const { theme, t } = env
  const a = Math.min(clamp(local / 0.3), clamp((dur - local) / 0.5))
  ctx.save()
  ctx.globalAlpha *= a
  ctx.fillStyle = WALL
  ctx.fillRect(0, 0, W, H)
  header(ctx, theme)
  let y = 260
  THREAD.forEach(([key, side], i) => {
    const text = theme.texts[key]
    if (!text) return
    const start = 0.5 + i * STEP
    // typing indicator just before each message
    if (local > start - 0.55 && local < start) typingDots(ctx, side < 0 ? 90 : W - 240, y, t)
    const h = chatBubble(ctx, text, side, y, prog(local, start, 0.35), { right: PURPLE })
    if (local >= start) y += h + 28
  })
  ctx.restore()
}

export default {
  id: 'chat',
  name: 'Group Chat',
  description: 'The announcement drops in the family group chat: typing dots, bubbles, emoji reactions.',
  music: 'bhangra',
  category: 'Gen-Z',
  openingDuration: 0.6 + THREAD.length * STEP + 1.4,
  palette: { text: '#3c3456', heading: PURPLE, accent: '#ff5fa2', soft: '#857aa8', card: 'rgba(255,255,255,.92)', cardStroke: '#d9d0ff', medallion: '#fff', heart: '#ff5fa2' },
  fonts: { title: 'Fredoka', script: 'Pacifico', scriptStyle: 'normal', body: 'Fredoka', deva: 'Yatra One' },
  glow: null,
  texts: {
    deva: '',
    group: 'Shaadi Squad 🎉',
    members: 'Mom, Dad, Bua, Chachu, you…',
    chat1: 'guys… big announcement 👀',
    chat2: 'omg spill the chai ☕',
    chat3: "WE'RE GETTING MARRIED 💍💍",
    chat4: 'no wayyy 😭😭',
    chat5: "it's giving shaadi season fr 💅",
    chat6: 'be there or be square 🫶',
    coupleLine: 'ARE OFFICIALLY OFF THE MARKET',
    dateHeading: 'save the date bestie',
    timePrefix: 'pull up at',
    eventsHeading: 'The Itinerary ✨',
    thanks: 'no cap, see you there 🫶',
  },
  textLabels: [
    ['group', 'Chat name'],
    ['members', 'Chat members line'],
    ['chat1', 'Message 1 (couple)'],
    ['chat2', 'Message 2 (friend)'],
    ['chat3', 'Message 3 (couple)'],
    ['chat4', 'Message 4 (friend)'],
    ['chat5', 'Message 5 (friend)'],
    ['chat6', 'Message 6 (couple)'],
  ],
  hideTexts: ['main', 'sub', 'deva'],
  scenes: { opening },
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: ['#ff5fa2', PURPLE, '#ffd166'],
  background(ctx) {
    ctx.fillStyle = WALL
    ctx.fillRect(0, 0, W, H)
    // faint doodle wallpaper
    ctx.globalAlpha = 0.07
    for (let y = 60; y < H; y += 160) for (let x = 60; x < W; x += 160) emoji(ctx, ['💬', '❤️', '✨', '😂'][((x + y) / 160) % 4 | 0], x + ((y / 160) % 2) * 80, y, 50)
    ctx.globalAlpha = 1
  },
  particles(ctx, t) {
    emojiFloat(ctx, t, ['😍', '🥳', '💯', '❤️', '🔥', '😭'], { count: 10, size: 56, alpha: 0.75 })
  },
  foreground() {},
  coupleBackdrop(ctx, local, env, archBottom) {
    stageCard(ctx, local, archBottom, {
      fill: (c, top, bottom) => {
        const g = c.createLinearGradient(0, top, 0, bottom)
        g.addColorStop(0, '#cbbcff')
        g.addColorStop(1, '#ffc3e1')
        c.fillStyle = g
        c.fill()
      },
      stroke: '#fff',
      lineWidth: 12,
    })
  },
  clipStage(ctx, archBottom) {
    clipCard(ctx, archBottom)
  },
  stageFront(ctx, archBottom) {
    band(ctx, archBottom, 40, '#fff', null)
  },
  coupleOverlay(ctx, local) {
    // emoji reactions pop onto the card
    const reacts = ['❤️', '😭', '🔥', '🥳']
    reacts.forEach((e, i) => {
      const p = prog(local, 2.8 + i * 0.25, 0.3)
      if (p <= 0) return
      ctx.save()
      roundRect(ctx, 150 + i * 120, 1180, 100, 90, 45)
      ctx.fillStyle = '#fff'
      ctx.globalAlpha *= p
      ctx.fill()
      ctx.restore()
      emoji(ctx, e, 200 + i * 120, 1226, 52 * p)
    })
  },
  closingBase(ctx, y) {
    closingBand(ctx, y, WALL, null)
  },
}
