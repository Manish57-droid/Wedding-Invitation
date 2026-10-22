import { clamp } from './anim.js'
import { SCENES, buildTimeline } from './scenes.js'
import { getTemplate } from './templates/index.js'
import { H, W } from './templates/base.js'

export const VIDEO_W = W
export const VIDEO_H = H

/**
 * Create a renderer for one invitation. render(ctx, t) draws frame t (seconds)
 * and is a pure function of t, so preview and export produce identical frames.
 */
export function createInvitation(data, assets) {
  const theme = getTemplate(data.templateId)
  const { scenes, duration } = buildTimeline(data, theme, assets)
  const openingScene = scenes.find((s) => s.id === 'opening')

  function render(ctx, t) {
    const scale = ctx.canvas.width / W
    ctx.save()
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    const env = { W, H, t, data, assets, theme }
    theme.background(ctx, t, env)
    theme.particles(ctx, t, env)

    for (const s of scenes) {
      const local = t - s.start
      if (local < 0 || local > s.dur || s.id === 'invocation') continue
      ctx.save()
      SCENES[s.id](ctx, local, s.dur, env)
      ctx.restore()
    }
    // doors / curtains stay closed until the opening scene, so the invocation sits on top of them
    if (theme.openingOverlay && openingScene) theme.openingOverlay(ctx, t - openingScene.start, env)
    const inv = scenes.find((s) => s.id === 'invocation')
    if (inv && t <= inv.start + inv.dur) {
      ctx.save()
      SCENES.invocation(ctx, t - inv.start, inv.dur, env)
      ctx.restore()
    }

    theme.foreground(ctx, t, env)

    // fade in from black, fade out at the end
    const fade = Math.max(1 - clamp(t / 0.5), clamp((t - (duration - 0.8)) / 0.8))
    if (fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${fade})`
      ctx.fillRect(0, 0, W, H)
    }
    ctx.restore()
  }

  return { duration, scenes, render, theme }
}
