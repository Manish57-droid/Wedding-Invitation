import { rgba } from '../lib/color.js'
import { clamp, ease, fadeWindow, prog, rnd } from './anim.js'
import { drawAvatar, drawAvatarMedallion, drawVarmala } from './avatarDraw.js'
import { dateParts, eventIcon, formatTime, initials, shortDate } from './format.js'
import { divider, firework, heart, kalash, mandala } from './ornaments.js'
import { drawParagraph, drawText } from './text.js'

const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'

function names(data) {
  return { g: data.groom?.name?.trim() || 'Groom', b: data.bride?.name?.trim() || 'Bride' }
}

/** Scene alpha with a slight upward drift on entry. */
function enter(local, dur) {
  return { a: fadeWindow(local, dur, 0.7, 0.6), dy: (1 - ease.outCubic(clamp(local / 0.9))) * 40 }
}

// ---------------------------------------------------------------------------

function invocation(ctx, local, dur, env) {
  const { W, theme, t } = env
  const { a, dy } = enter(local, dur)
  const P = theme.palette
  const F = theme.fonts
  ctx.save()
  ctx.globalAlpha *= a
  ctx.translate(0, dy)
  // soft panel keeps the text readable over doors / curtains
  roundRect(ctx, 130, 440, W - 260, 1060, 60)
  ctx.fillStyle = rgba(P.medallion, 0.82)
  ctx.fill()
  ctx.strokeStyle = rgba(P.accent, 0.8)
  ctx.lineWidth = 3
  ctx.stroke()
  const p = ease.outCubic(prog(local, 0.1, 2.2))
  mandala(ctx, W / 2, 780, 300, rgba(P.accent, 0.55), t * 0.15, p, 2.5)
  mandala(ctx, W / 2, 780, 190, rgba(P.accent, 0.35), -t * 0.2, p, 2)
  if (theme.emblem === 'kalash') {
    const s = 150 * ease.outBack(prog(local, 0.4, 1))
    if (s > 0) kalash(ctx, W / 2, 800, s, theme.emblemColor || P.accent, t)
  } else {
    heart(ctx, W / 2, 790, 120 * ease.outBack(prog(local, 0.4, 1)), P.accent)
  }
  drawText(ctx, theme.texts.invocation, W / 2, 1210, { family: F.deva, size: 82, color: P.heading, alpha: prog(local, 1, 0.8), shadow: theme.glow })
  drawText(ctx, theme.texts.invocationLatin, W / 2, 1310, { family: F.title, size: 34, color: P.soft, alpha: prog(local, 1.4, 0.8), spacing: 6 })
  divider(ctx, W / 2, 1380, 280, P.accent, ease.outCubic(prog(local, 1.6, 0.8)))
  ctx.restore()
}

function opening(ctx, local, dur, env) {
  const { W, theme, data, t } = env
  const { a, dy } = enter(local, dur)
  const P = theme.palette
  const F = theme.fonts
  const { g, b } = names(data)
  ctx.save()
  ctx.globalAlpha *= a
  ctx.translate(0, dy)
  // monogram medallion
  const mp = ease.outBack(prog(local, 0.6, 1.1))
  if (mp > 0) {
    ctx.save()
    ctx.translate(W / 2, 640)
    ctx.scale(mp, mp)
    mandala(ctx, 0, 0, 210, rgba(P.accent, 0.6), t * 0.2, 1, 2)
    ctx.beginPath()
    ctx.arc(0, 0, 130, 0, Math.PI * 2)
    ctx.fillStyle = P.medallion
    ctx.fill()
    ctx.lineWidth = 5
    ctx.strokeStyle = P.accent
    ctx.stroke()
    const ini = initials(g, b)
    drawText(ctx, `${ini[0] || ''} ${theme.texts.amp} ${ini[1] || ''}`, 0, 6, { family: F.script, size: 110, style: F.scriptStyle, color: P.heading, maxWidth: 230 })
    ctx.restore()
  }
  if (theme.texts.deva) {
    drawText(ctx, theme.texts.deva, W / 2, 1010, { family: F.deva, size: 150, color: P.heading, alpha: prog(local, 1.2, 0.8), shadow: theme.glow })
  }
  drawText(ctx, theme.texts.main, W / 2, theme.texts.deva ? 1150 : 1040, {
    family: theme.texts.deva ? F.title : F.script,
    style: theme.texts.deva ? 'normal' : F.scriptStyle,
    size: theme.texts.deva ? 54 : 120,
    color: theme.texts.deva ? P.soft : P.heading,
    spacing: theme.texts.deva ? 10 : 0,
    reveal: ease.linear(prog(local, 1.5, 1.1)),
  })
  divider(ctx, W / 2, 1250, 360, P.accent, ease.outCubic(prog(local, 2, 0.8)))
  drawText(ctx, theme.texts.sub, W / 2, 1340, { family: F.body, size: 46, style: 'italic', color: P.text, alpha: prog(local, 2.3, 0.8) })
  ctx.restore()
}

function couple(ctx, local, dur, env) {
  const { W, theme, data, assets, t } = env
  const a = fadeWindow(local, dur, 0.5, 0.6)
  const P = theme.palette
  const F = theme.fonts
  const { g, b } = names(data)
  ctx.save()
  ctx.globalAlpha *= a

  const archBottom = 1250
  theme.coupleBackdrop(ctx, local, env, archBottom)

  // avatars slide in from the sides and settle next to each other
  const h = 720
  const slide = ease.outBack(prog(local, 0.3, 1.4))
  const gx = 360 + (1 - slide) * -620
  const bx = 720 + (1 - slide) * 620
  const lean = ease.inOutCubic(prog(local, 1.6, 0.8)) * 0.05
  const ay = archBottom + 40
  ctx.save()
  theme.clipStage(ctx, archBottom)
  drawAvatar(ctx, assets, 'groom', gx, ay, h, { t, tilt: lean })
  drawAvatar(ctx, assets, 'bride', bx, ay, h, { t, tilt: -lean })
  if (theme.coupleEffect !== 'hearts') {
    const drop = ease.outBack(prog(local, 2.1, 0.9))
    drawVarmala(ctx, gx, ay, h, drop, { t, colors: theme.garland })
    drawVarmala(ctx, bx, ay, h, ease.outBack(prog(local, 2.4, 0.9)), { t: t + 1.3, colors: theme.garland })
  }
  ctx.restore()
  theme.stageFront(ctx, archBottom, t, env)
  theme.coupleOverlay?.(ctx, local, env, archBottom)

  // celebration burst once the garlands land
  const bp = prog(local, 2.8, 2.2)
  if (bp > 0 && bp < 1) {
    for (let i = 0; i < 18; i++) {
      const ang = -Math.PI / 2 + (rnd(i, 9) - 0.5) * 2.4
      const r = ease.outCubic(bp) * (260 + rnd(i, 4) * 220)
      const x = W / 2 + Math.cos(ang) * r
      const y = 620 + Math.sin(ang) * r + bp * bp * 300
      ctx.save()
      ctx.globalAlpha *= 1 - bp
      heart(ctx, x, y, 34 + rnd(i, 2) * 26, i % 2 ? P.accent : P.heart)
      ctx.restore()
    }
  }
  if (theme.coupleEffect === 'fireworks') {
    firework(ctx, 260, 420, prog(local, 2.6, 1.6), '#ffd27a', 1)
    firework(ctx, 820, 360, prog(local, 3.1, 1.6), '#ff8fb1', 2)
    firework(ctx, 560, 260, prog(local, 3.7, 1.6), '#9fe6ff', 3, 260)
  }

  // names
  const np = prog(local, 1.4, 1.2)
  drawText(ctx, g, W / 2, 1400, { family: F.script, style: F.scriptStyle, size: 120, color: P.heading, reveal: np, shadow: theme.glow, maxWidth: 900 })
  drawText(ctx, theme.texts.amp, W / 2, 1515, { family: F.script, style: F.scriptStyle, size: 90, color: P.accent, alpha: prog(local, 2, 0.6) })
  drawText(ctx, b, W / 2, 1630, { family: F.script, style: F.scriptStyle, size: 120, color: P.heading, reveal: prog(local, 2.2, 1.2), shadow: theme.glow, maxWidth: 900 })
  drawText(ctx, theme.texts.coupleLine, W / 2, 1760, { family: F.title, size: 38, color: P.soft, alpha: prog(local, 3.2, 0.8), spacing: 6 })
  ctx.restore()
}

function families(ctx, local, dur, env) {
  const { W, theme, data, assets, t } = env
  const { a, dy } = enter(local, dur)
  const P = theme.palette
  const F = theme.fonts
  const { g, b } = names(data)
  ctx.save()
  ctx.globalAlpha *= a
  ctx.translate(0, dy)
  const mp = ease.outBack(prog(local, 0.2, 0.9))
  if (mp > 0) {
    drawAvatarMedallion(ctx, assets, 'groom', W / 2 - 150, 430, 130 * mp, { t, ring: P.accent, bg: P.medallion })
    drawAvatarMedallion(ctx, assets, 'bride', W / 2 + 150, 430, 130 * mp, { t, ring: P.accent, bg: P.medallion })
    heart(ctx, W / 2, 560, 60 * mp, P.heart)
  }
  let y = 700
  if (data.blessings?.trim()) {
    drawText(ctx, theme.texts.blessingsLabel, W / 2, y, { family: F.title, size: 32, color: P.soft, spacing: 5, alpha: prog(local, 0.5, 0.6) })
    y = drawParagraph(ctx, data.blessings, W / 2, y + 60, { family: F.body, size: 46, style: 'italic', color: P.text, alpha: prog(local, 0.7, 0.6) }) + 20
  }
  divider(ctx, W / 2, y, 260, P.accent, ease.outCubic(prog(local, 0.8, 0.8)))
  y += 80
  const gp = data.groom?.parents?.trim()
  const bp = data.bride?.parents?.trim()
  if (gp || bp) {
    if (gp) y = drawParagraph(ctx, gp, W / 2, y, { family: F.title, size: 48, weight: 600, color: P.heading, alpha: prog(local, 1, 0.6) })
    if (gp && bp) {
      drawText(ctx, theme.texts.amp, W / 2, y + 10, { family: F.script, style: F.scriptStyle, size: 70, color: P.accent, alpha: prog(local, 1.2, 0.6) })
      y += 90
    }
    if (bp) y = drawParagraph(ctx, bp, W / 2, y, { family: F.title, size: 48, weight: 600, color: P.heading, alpha: prog(local, 1.4, 0.6) })
    y += 40
  }
  y = drawParagraph(ctx, data.inviteLine?.trim() || 'request the pleasure of your company at the wedding of', W / 2, y, {
    family: F.body, size: 46, style: 'italic', color: P.text, maxWidth: 820, alpha: prog(local, 1.7, 0.7),
  })
  drawText(ctx, `${g} ${theme.texts.amp} ${b}`, W / 2, y + 90, { family: F.script, style: F.scriptStyle, size: 110, color: P.heading, reveal: prog(local, 2.1, 1.2), shadow: theme.glow, maxWidth: 940 })
  ctx.restore()
}

function dateVenue(ctx, local, dur, env) {
  const { W, theme, data } = env
  const { a, dy } = enter(local, dur)
  const P = theme.palette
  const F = theme.fonts
  const d = dateParts(data.date)
  ctx.save()
  ctx.globalAlpha *= a
  ctx.translate(0, dy)
  drawText(ctx, theme.texts.dateHeading, W / 2, 380, { family: F.script, style: F.scriptStyle, size: 110, color: P.heading, reveal: prog(local, 0.2, 1), shadow: theme.glow })
  divider(ctx, W / 2, 470, 300, P.accent, ease.outCubic(prog(local, 0.6, 0.8)))
  if (d) {
    const cp = ease.outBack(prog(local, 0.7, 0.9))
    ctx.save()
    ctx.translate(W / 2, 740)
    ctx.scale(cp, cp)
    // weekday | day | month layout
    ctx.strokeStyle = P.accent
    ctx.lineWidth = 3
    for (const sx of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(sx * 150, -90)
      ctx.lineTo(sx * 150, 90)
      ctx.stroke()
    }
    drawText(ctx, d.weekday.toUpperCase(), -300, 0, { family: F.title, size: 40, color: P.text, spacing: 4, maxWidth: 260 })
    drawText(ctx, String(d.day), 0, 8, { family: F.title, size: 210, weight: 700, color: P.heading, shadow: theme.glow, maxWidth: 280 })
    drawText(ctx, d.month.toUpperCase(), 300, -24, { family: F.title, size: 44, color: P.text, spacing: 4, maxWidth: 260 })
    drawText(ctx, String(d.year), 300, 34, { family: F.title, size: 40, color: P.soft, spacing: 4, maxWidth: 260 })
    ctx.restore()
  }
  if (data.time) {
    drawText(ctx, [theme.texts.timePrefix, formatTime(data.time)].filter(Boolean).join(' '), W / 2, 920, { family: F.body, size: 50, style: 'italic', color: P.text, alpha: prog(local, 1.3, 0.6) })
  }
  // venue card
  const vp = ease.outCubic(prog(local, 1.6, 0.9))
  if (vp > 0 && (data.venue || data.address)) {
    ctx.save()
    ctx.globalAlpha *= vp
    ctx.translate(0, (1 - vp) * 60)
    roundRect(ctx, 110, 1030, W - 220, 470, 36)
    ctx.fillStyle = P.card
    ctx.fill()
    ctx.strokeStyle = P.cardStroke
    ctx.lineWidth = 3
    ctx.stroke()
    pin(ctx, W / 2, 1120, P.accent)
    drawText(ctx, theme.texts.venueLabel, W / 2, 1200, { family: F.title, size: 34, color: P.soft, spacing: 8 })
    let y = drawParagraph(ctx, data.venue || '', W / 2, 1280, { family: F.title, size: 56, weight: 600, color: P.heading, maxWidth: 760 })
    drawParagraph(ctx, data.address || '', W / 2, y + 10, { family: F.body, size: 42, color: P.text, maxWidth: 760 })
    ctx.restore()
  }
  ctx.restore()
}

function events(ctx, local, dur, env) {
  const { W, theme, data } = env
  const { a, dy } = enter(local, dur)
  const P = theme.palette
  const F = theme.fonts
  const list = (data.events || []).filter((e) => e.name?.trim()).slice(0, 6)
  ctx.save()
  ctx.globalAlpha *= a
  ctx.translate(0, dy)
  drawText(ctx, theme.texts.eventsHeading, W / 2, 330, { family: F.script, style: F.scriptStyle, size: 104, color: P.heading, reveal: prog(local, 0.1, 1), shadow: theme.glow })
  divider(ctx, W / 2, 420, 300, P.accent, ease.outCubic(prog(local, 0.5, 0.8)))
  const top = 490
  const avail = 1720 - top
  const gap = 26
  const cardH = Math.min(220, (avail - gap * (list.length - 1)) / list.length)
  list.forEach((ev, i) => {
    const p = ease.outBack(prog(local, 0.7 + i * 0.45, 0.8))
    if (p <= 0) return
    const y = top + i * (cardH + gap)
    const side = i % 2 ? 1 : -1
    ctx.save()
    ctx.globalAlpha *= clamp(p)
    ctx.translate(side * (1 - p) * 500, 0)
    roundRect(ctx, 100, y, W - 200, cardH, 30)
    ctx.fillStyle = P.card
    ctx.fill()
    ctx.strokeStyle = P.cardStroke
    ctx.lineWidth = 3
    ctx.stroke()
    const cy = y + cardH / 2
    ctx.beginPath()
    ctx.arc(200, cy, cardH * 0.33, 0, Math.PI * 2)
    ctx.fillStyle = rgba(P.accent, 0.18)
    ctx.fill()
    ctx.font = `${Math.round(cardH * 0.34)}px ${EMOJI_FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000'
    ctx.fillText(eventIcon(ev.name), 200, cy + 3)
    const big = cardH > 170
    drawText(ctx, ev.name, 300, cy - cardH * (ev.venue ? 0.24 : 0.16), { family: F.title, size: big ? 52 : 42, weight: 700, color: P.heading, align: 'left', maxWidth: 620 })
    const when = [shortDate(ev.date), formatTime(ev.time)].filter(Boolean).join('  •  ')
    drawText(ctx, when, 300, cy + (ev.venue ? 0 : cardH * 0.16), { family: F.body, size: big ? 40 : 34, color: P.text, align: 'left', maxWidth: 620 })
    if (ev.venue) drawText(ctx, ev.venue, 300, cy + cardH * 0.24, { family: F.body, size: big ? 36 : 30, style: 'italic', color: P.soft, align: 'left', maxWidth: 620 })
    ctx.restore()
  })
  ctx.restore()
}

function photos(ctx, local, dur, env) {
  const { W, theme, data, assets, t } = env
  const { a, dy } = enter(local, dur)
  const P = theme.palette
  const F = theme.fonts
  const { g, b } = names(data)
  ctx.save()
  ctx.globalAlpha *= a
  ctx.translate(0, dy)
  drawText(ctx, theme.texts.photoHeading, W / 2, 470, { family: F.script, style: F.scriptStyle, size: 100, color: P.heading, reveal: prog(local, 0.1, 1), shadow: theme.glow })
  const items = [
    ['groom', g, W / 2 - 220, -1],
    ['bride', b, W / 2 + 220, 1],
  ]
  items.forEach(([who, name, x, side], i) => {
    const img = assets.photos?.[who]
    const p = ease.outBack(prog(local, 0.5 + i * 0.3, 1))
    if (p <= 0) return
    const y = 900 + Math.sin(t * 1.5 + i) * 8
    const r = 200 * p
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(side * 0.05 * p)
    ctx.beginPath()
    ctx.arc(0, 0, r + 16, 0, Math.PI * 2)
    ctx.fillStyle = P.accent
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.save()
    ctx.clip()
    if (img) ctx.drawImage(img, -r, -r, r * 2, r * 2)
    else {
      ctx.fillStyle = P.medallion
      ctx.fill()
    }
    ctx.restore()
    ctx.restore()
    drawText(ctx, name, x, 1190, { family: F.script, style: F.scriptStyle, size: 84, color: P.heading, alpha: prog(local, 1 + i * 0.3, 0.6), maxWidth: 420 })
  })
  heart(ctx, W / 2, 920, 90 * ease.outElastic(prog(local, 1.2, 1.2)), P.heart)
  drawText(ctx, theme.texts.photoLine, W / 2, 1360, { family: F.body, size: 48, style: 'italic', color: P.text, alpha: prog(local, 1.6, 0.8) })
  ctx.restore()
}

function closing(ctx, local, dur, env) {
  const { W, theme, data, assets, t } = env
  const a = Math.min(clamp(local / 0.7), 1)
  const dy = (1 - ease.outCubic(clamp(local / 0.9))) * 40
  const P = theme.palette
  const F = theme.fonts
  ctx.save()
  ctx.globalAlpha *= a
  ctx.translate(0, dy)
  const sp = ease.outBack(prog(local, 0.2, 1))
  if (sp > 0) {
    drawAvatar(ctx, assets, 'groom', W / 2 - 120, 860, 520 * sp, { t, tilt: 0.05 })
    drawAvatar(ctx, assets, 'bride', W / 2 + 120, 860, 520 * sp, { t, tilt: -0.05 })
    theme.closingBase(ctx, 860, t, env)
  }
  const msg = data.closing?.trim() || 'Your presence and blessings will make our celebration complete'
  let y = drawParagraph(ctx, msg, W / 2, 1010, { family: F.body, size: 52, style: 'italic', color: P.text, maxWidth: 860, alpha: prog(local, 0.8, 0.8) })
  divider(ctx, W / 2, y + 20, 280, P.accent, ease.outCubic(prog(local, 1.1, 0.8)))
  y += 110
  if (data.hashtag?.trim()) {
    const tag = data.hashtag.trim().startsWith('#') ? data.hashtag.trim() : `#${data.hashtag.trim()}`
    drawText(ctx, tag, W / 2, y, { family: F.title, size: 54, weight: 700, color: P.heading, alpha: prog(local, 1.4, 0.6), shadow: theme.glow })
    y += 100
  }
  if (data.rsvp?.trim()) {
    drawText(ctx, theme.texts.rsvpLabel, W / 2, y, { family: F.title, size: 34, color: P.soft, spacing: 8, alpha: prog(local, 1.7, 0.6) })
    drawParagraph(ctx, data.rsvp, W / 2, y + 64, { family: F.body, size: 44, color: P.text, maxWidth: 860, alpha: prog(local, 1.9, 0.6) })
  }
  drawText(ctx, theme.texts.thanks, W / 2, 1780, { family: F.script, style: F.scriptStyle, size: 80, color: P.heading, reveal: prog(local, 2.4, 1) })
  ctx.restore()
}

// ---------------------------------------------------------------------------

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function pin(ctx, x, y, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y - 10, 26, Math.PI, 0)
  ctx.quadraticCurveTo(x + 26, y + 14, x, y + 40)
  ctx.quadraticCurveTo(x - 26, y + 14, x - 26, y - 10)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x, y - 10, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export const SCENES = { invocation, opening, couple, families, dateVenue, events, photos, closing }

/** Build the scene list for this invitation; scenes overlap slightly for cross-fades. */
export function buildTimeline(data, theme, assets) {
  const list = []
  const on = (id) => data.scenes?.[id] !== false
  if (data.showInvocation) list.push(['invocation', 4])
  list.push(['opening', theme.openingDuration || 4.6])
  list.push(['couple', 7.2])
  if (on('families') && (data.groom?.parents || data.bride?.parents || data.blessings)) list.push(['families', 6])
  if (on('dateVenue') && (data.date || data.venue)) list.push(['dateVenue', 6.5])
  const evCount = (data.events || []).filter((e) => e.name?.trim()).length
  if (on('events') && evCount) list.push(['events', 2.6 + Math.min(evCount, 6) * 0.9])
  if (data.includePhotos && (assets?.photos?.groom || assets?.photos?.bride)) list.push(['photos', 5])
  list.push(['closing', 6.5])
  const overlap = 0.5
  let start = 0
  const scenes = list.map(([id, dur]) => {
    const s = { id, start, dur }
    start += dur - overlap
    return s
  })
  return { scenes, duration: start + overlap }
}
