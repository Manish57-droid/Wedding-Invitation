export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
export const lerp = (a, b, t) => a + (b - a) * t

/** Progress of t through [start, start + dur], clamped to [0, 1]. */
export const prog = (t, start, dur) => clamp((t - start) / dur)

export const ease = {
  linear: (x) => x,
  inQuad: (x) => x * x,
  outQuad: (x) => 1 - (1 - x) * (1 - x),
  inOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  outCubic: (x) => 1 - (1 - x) ** 3,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  outBack: (x) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
  },
  outElastic: (x) => (x === 0 || x === 1 ? x : 2 ** (-10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
}

/** Fade in over `inDur` at the start of a [0, dur] window and out over `outDur` at its end. */
export function fadeWindow(local, dur, inDur = 0.6, outDur = 0.6) {
  if (local < 0 || local > dur) return 0
  return Math.min(clamp(local / inDur), clamp((dur - local) / outDur))
}

/** Deterministic PRNG so preview and export render identical frames. */
export function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stable random value for (index, salt); avoids storing particle state between frames. */
export function rnd(i, salt = 0) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}
