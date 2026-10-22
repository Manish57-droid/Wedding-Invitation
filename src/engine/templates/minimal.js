import { rgba } from '../../lib/color.js'
import { clamp, ease, prog } from '../anim.js'
import { arch, sprig } from '../ornaments.js'
import { floatingDots } from '../particles.js'
import { DEFAULT_TEXT, H, W, clipAbove } from './base.js'

const INK = '#2f2a26'
const CLAY = '#b5835a'
const SAGE = '#8fa585'
const BG = '#f7f2ea'

function blob(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color)
  g.addColorStop(1, rgba(BG, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

export default {
  id: 'minimal',
  name: 'Modern Minimal',
  description: 'Clean ivory, botanical line art and elegant serif type.',
  music: 'piano',
  palette: {
    text: '#4a423b',
    heading: INK,
    accent: CLAY,
    soft: '#8a8077',
    card: 'rgba(255,255,255,.75)',
    cardStroke: '#dccbb8',
    medallion: '#efe6da',
    heart: '#d98c7a',
  },
  fonts: { title: 'Playfair Display', script: 'Cormorant Garamond', scriptStyle: 'italic', body: 'Cormorant Garamond', deva: 'Yatra One' },
  glow: null,
  tagline: { deva: '', main: "We're getting married", sub: 'and we would love for you to be there' },
  ...DEFAULT_TEXT,
  timePrefix: 'at',
  emblem: 'heart',
  coupleEffect: 'hearts',
  garland: ['#f3dcd2', '#ffffff', '#d98c7a'],

  background(ctx, t) {
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)
    blob(ctx, 200 + Math.sin(t * 0.3) * 60, 360, 520, 'rgba(223,230,213,.9)')
    blob(ctx, 900 + Math.cos(t * 0.25) * 60, 1500, 600, 'rgba(243,220,210,.9)')
  },
  particles(ctx, t) {
    floatingDots(ctx, t, W, H, { count: 24, color: CLAY })
  },
  foreground(ctx, t, env) {
    const p = ease.outCubic(clamp(env.t / 2.5))
    ctx.save()
    ctx.strokeStyle = rgba(INK, 0.5)
    ctx.lineWidth = 2
    const per = 2 * (W - 120 + H - 120)
    ctx.setLineDash([per * p, per])
    ctx.strokeRect(60, 60, W - 120, H - 120)
    ctx.restore()
    const sp = ease.inOutCubic(clamp(env.t / 3))
    sprig(ctx, 60, 300, 330, -0.95, SAGE, sp, 3)
    sprig(ctx, 60, 300, 250, -0.35, SAGE, sp, 3)
    sprig(ctx, W - 60, H - 300, 330, Math.PI - 0.95, SAGE, sp, 3)
    sprig(ctx, W - 60, H - 300, 250, Math.PI - 0.35, SAGE, sp, 3)
    void t
  },
  coupleBackdrop(ctx, local, env, archBottom) {
    const p = ease.outCubic(prog(local, 0, 1.2))
    ctx.save()
    ctx.globalAlpha *= p
    arch(ctx, W / 2, archBottom, 860, 980, rgba(INK, 0.55), 'rgba(243,220,210,.55)', 2.5)
    ctx.restore()
    sprig(ctx, W / 2 - 430, archBottom - 40, 300, -1.2, SAGE, p, 3)
    sprig(ctx, W / 2 + 430, archBottom - 40, 300, Math.PI + 1.2, SAGE, p, 3)
  },
  clipStage(ctx, archBottom) {
    clipAbove(ctx, archBottom)
  },
  stageFront(ctx, archBottom) {
    ctx.strokeStyle = rgba(INK, 0.55)
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(W / 2 - 470, archBottom)
    ctx.lineTo(W / 2 + 470, archBottom)
    ctx.stroke()
  },
  closingBase(ctx, y) {
    ctx.fillStyle = BG
    ctx.fillRect(W / 2 - 300, y, 600, 40)
    ctx.strokeStyle = rgba(INK, 0.55)
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(W / 2 - 300, y)
    ctx.lineTo(W / 2 + 300, y)
    ctx.stroke()
  },
}
