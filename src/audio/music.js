import { seeded } from '../engine/anim.js'

export const SAMPLE_RATE = 48000

export const MUSIC_STYLES = [
  { id: 'royal', label: 'Royal santoor (Raag Yaman)' },
  { id: 'bhangra', label: 'Upbeat dhol & bhangra' },
  { id: 'festive', label: 'Festive dholak & shehnai' },
  { id: 'dreamy', label: 'Dreamy night bells' },
  { id: 'piano', label: 'Soft piano' },
]

const SA = 261.63
const hz = (semi) => SA * 2 ** (semi / 12)

const SCALES = {
  royal: [-12, -10, -8, -6, -5, -3, -1, 0, 2, 4, 6, 7, 9, 11, 12], // Yaman (tivra Ma)
  festive: [-5, -3, -1, 0, 2, 4, 5, 7, 9, 11, 12, 14],
  dreamy: [-5, -3, 0, 2, 4, 7, 9, 12, 14, 16],
  piano: [0, 2, 4, 5, 7, 9, 11, 12],
}

function noiseBuffer(ctx) {
  const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const d = b.getChannelData(0)
  const r = seeded(99)
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1
  return b
}

function reverb(ctx, seconds = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  const r = seeded(7)
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * (1 - i / len) ** 3
  }
  const c = ctx.createConvolver()
  c.buffer = ir
  return c
}

function env(g, time, peak, attack, decay) {
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(peak, time + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay)
}

/** Santoor / bell / piano-like plucked tone built from a few harmonics. */
function pluck(ctx, dest, time, freq, { gain = 0.2, decay = 1.4, partials = [1, 0.35, 0.12], type = 'sine', pan = 0 } = {}) {
  const g = ctx.createGain()
  env(g, time, gain, 0.004, decay)
  const p = ctx.createStereoPanner()
  p.pan.value = pan
  g.connect(p).connect(dest)
  partials.forEach((amp, i) => {
    if (!amp) return
    const o = ctx.createOscillator()
    o.type = i === 0 ? type : 'sine'
    o.frequency.value = freq * (i + 1) * (i === 1 ? 1.002 : 1)
    const og = ctx.createGain()
    og.gain.value = amp
    o.connect(og).connect(g)
    o.start(time)
    o.stop(time + decay + 0.1)
  })
}

/** Shehnai-ish reed lead: bright sawtooth with vibrato through a band-pass. */
function reed(ctx, dest, time, freq, dur, gain = 0.07) {
  const o = ctx.createOscillator()
  o.type = 'sawtooth'
  o.frequency.value = freq
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 5.5
  const lg = ctx.createGain()
  lg.gain.value = freq * 0.012
  lfo.connect(lg).connect(o.frequency)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq * 2.2
  bp.Q.value = 1.4
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(gain, time + 0.06)
  g.gain.setValueAtTime(gain, time + dur * 0.75)
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
  o.connect(bp).connect(g).connect(dest)
  for (const n of [o, lfo]) {
    n.start(time)
    n.stop(time + dur + 0.05)
  }
}

function drum(ctx, dest, noise, time, kind, gain = 1) {
  if (kind === 'dha' || kind === 'dhol') {
    const o = ctx.createOscillator()
    o.type = 'sine'
    const f0 = kind === 'dhol' ? 120 : 140
    o.frequency.setValueAtTime(f0, time)
    o.frequency.exponentialRampToValueAtTime(55, time + 0.25)
    const g = ctx.createGain()
    env(g, time, 0.5 * gain, 0.003, 0.35)
    o.connect(g).connect(dest)
    o.start(time)
    o.stop(time + 0.4)
  }
  if (kind === 'na' || kind === 'dha' || kind === 'ta') {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = kind === 'ta' ? 520 : 380
    const g = ctx.createGain()
    env(g, time, 0.16 * gain, 0.002, 0.16)
    o.connect(g).connect(dest)
    o.start(time)
    o.stop(time + 0.2)
    const n = ctx.createBufferSource()
    n.buffer = noise
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2500
    const ng = ctx.createGain()
    env(ng, time, 0.06 * gain, 0.001, 0.07)
    n.connect(hp).connect(ng).connect(dest)
    n.start(time, (time * 7.3) % 0.5, 0.1)
  }
}

/** Punjabi dhol: deep "dagga" bass side or sharp "tilli" treble side. */
function dhol(ctx, dest, noise, time, side, gain = 1) {
  if (side === 'dagga') {
    const o = ctx.createOscillator()
    o.frequency.setValueAtTime(110, time)
    o.frequency.exponentialRampToValueAtTime(48, time + 0.3)
    const g = ctx.createGain()
    env(g, time, 0.75 * gain, 0.002, 0.4)
    o.connect(g).connect(dest)
    o.start(time)
    o.stop(time + 0.45)
  }
  const n = ctx.createBufferSource()
  n.buffer = noise
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = side === 'dagga' ? 300 : 1800
  bp.Q.value = 1.2
  const ng = ctx.createGain()
  env(ng, time, (side === 'dagga' ? 0.25 : 0.32) * gain, 0.001, side === 'dagga' ? 0.12 : 0.08)
  n.connect(bp).connect(ng).connect(dest)
  n.start(time, (time * 5.1) % 0.5, 0.15)
}

function clap(ctx, dest, noise, time, gain = 0.25) {
  for (const d of [0, 0.012, 0.024]) {
    const n = ctx.createBufferSource()
    n.buffer = noise
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1300
    bp.Q.value = 0.9
    const g = ctx.createGain()
    env(g, time + d, gain, 0.001, d === 0.024 ? 0.14 : 0.03)
    n.connect(bp).connect(g).connect(dest)
    n.start(time + d, ((time + d) * 3.7) % 0.5, 0.2)
  }
}

/** Tumbi-like twang: bright square pluck with a little downward pitch bend. */
function tumbi(ctx, dest, time, freq, gain = 0.09) {
  const o = ctx.createOscillator()
  o.type = 'square'
  o.frequency.setValueAtTime(freq * 1.03, time)
  o.frequency.exponentialRampToValueAtTime(freq, time + 0.05)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(4200, time)
  lp.frequency.exponentialRampToValueAtTime(900, time + 0.25)
  const g = ctx.createGain()
  env(g, time, gain, 0.002, 0.28)
  o.connect(lp).connect(g).connect(dest)
  o.start(time)
  o.stop(time + 0.32)
}

function tanpura(ctx, dest, start, end, gain = 0.05) {
  // Pa – Sa – Sa – Sa(low) cycle, each string ringing long
  const strings = [hz(-5 - 12), hz(-12), hz(-12), hz(-24)]
  let t = start
  let i = 0
  while (t < end) {
    const f = strings[i % 4]
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = f
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    lp.Q.value = 3
    const g = ctx.createGain()
    env(g, t, gain, 0.02, 3)
    o.connect(lp).connect(g).connect(dest)
    o.start(t)
    o.stop(t + 3.2)
    t += 0.75
    i++
  }
}

function pad(ctx, dest, time, freqs, dur, gain = 0.04) {
  for (const f of freqs) {
    for (const det of [-6, 6]) {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = f
      o.detune.value = det
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, time)
      g.gain.exponentialRampToValueAtTime(gain, time + dur * 0.4)
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur)
      o.connect(g).connect(dest)
      o.start(time)
      o.stop(time + dur + 0.05)
    }
  }
}

/** Seeded melodic random walk over a scale, resolving to the tonic at phrase ends. */
function melody(scale, steps, rnd, phrase = 8) {
  const tonic = scale.indexOf(0)
  let idx = tonic
  const out = []
  for (let i = 0; i < steps; i++) {
    const end = i % phrase === phrase - 1
    if (end) idx = rnd() < 0.6 ? tonic : Math.min(scale.length - 1, tonic + 4)
    else {
      const move = [-2, -1, -1, 1, 1, 2, 0][Math.floor(rnd() * 7)]
      idx = Math.max(0, Math.min(scale.length - 1, idx + move))
    }
    const rest = !end && rnd() < 0.18
    out.push(rest ? null : scale[idx])
  }
  return out
}

/** Render a royalty-free background track for `duration` seconds. */
export async function generateMusic(style, duration) {
  const ctx = new OfflineAudioContext(2, Math.ceil(SAMPLE_RATE * duration), SAMPLE_RATE)
  const master = ctx.createGain()
  const comp = ctx.createDynamicsCompressor()
  master.connect(comp).connect(ctx.destination)
  master.gain.setValueAtTime(0.0001, 0)
  master.gain.exponentialRampToValueAtTime(0.9, 1.2)
  master.gain.setValueAtTime(0.9, Math.max(1.3, duration - 2.5))
  master.gain.linearRampToValueAtTime(0, duration)
  const verb = reverb(ctx)
  const wet = ctx.createGain()
  wet.gain.value = 0.35
  verb.connect(wet).connect(master)
  const bus = ctx.createGain()
  bus.connect(master)
  bus.connect(verb)
  const noise = noiseBuffer(ctx)
  const rnd = seeded({ royal: 11, festive: 23, dreamy: 37, piano: 51 }[style] || 1)
  const scale = SCALES[style] || SCALES.royal

  if (style === 'bhangra') {
    const beat = 60 / 104
    const s16 = beat / 4
    // classic bhangra chaal on the dhol, 16th-note grid
    const daggaHits = [0, 3, 6, 8, 11, 14]
    const tilliHits = [2, 4, 7, 10, 12, 13, 15]
    const start = 0.4
    const bars = Math.ceil((duration - start) / (beat * 4))
    // catchy tumbi hook, repeated with a variation every 4th bar
    const hook = [12, null, 12, 14, 12, null, 9, null, 7, null, 9, 12, null, 9, 7, null]
    const hookB = [14, null, 14, 16, 14, null, 12, null, 9, null, 12, 14, null, 12, 9, null]
    const bass = [0, 0, -5, -3]
    for (let bar = 0; bar < bars; bar++) {
      const t0 = start + bar * beat * 4
      const intro = bar < 1
      for (let i = 0; i < 16; i++) {
        const t = t0 + i * s16
        if (t > duration - 0.6) break
        if (daggaHits.includes(i)) dhol(ctx, bus, noise, t, 'dagga', intro ? 0.6 : 1)
        if (tilliHits.includes(i) && !intro) dhol(ctx, bus, noise, t, 'tilli', 0.8)
        if (!intro && (i === 4 || i === 12)) clap(ctx, bus, noise, t)
        const h = (bar % 4 === 3 ? hookB : hook)[i]
        if (!intro && h !== null && bar % 8 < 6) tumbi(ctx, bus, t, hz(h))
      }
      // bass line on the downbeats
      if (!intro) {
        const root = bass[bar % 4]
        for (const b of [0, 1.5, 2, 3]) pluck(ctx, bus, t0 + b * beat, hz(root - 24), { gain: 0.22, decay: 0.45, partials: [1, 0.5, 0.2], type: 'triangle' })
      }
      // shehnai-style lead answers the hook in the last bars of each 8
      if (bar % 8 >= 6) {
        const notes = melody(SCALES.festive, 8, rnd, 8)
        notes.forEach((n, i) => n !== null && reed(ctx, bus, t0 + (i * beat) / 2, hz(n + 12), beat * 0.5, 0.05))
      }
    }
  } else if (style === 'festive') {
    const beat = 60 / 112
    tanpura(ctx, bus, 0, duration, 0.03)
    const pattern = ['dhol', null, 'ta', 'dhol', 'na', null, 'dhol', 'ta']
    for (let t = 1, i = 0; t < duration; t += beat / 2, i++) {
      const k = pattern[i % 8]
      if (k) drum(ctx, bus, noise, t, k, t < 3 ? (t - 1) / 2 : 1)
    }
    const notes = melody(scale, Math.floor((duration - 3) / (beat / 2)), rnd, 8)
    notes.forEach((n, i) => {
      if (n === null) return
      const t = 2.5 + (i * beat) / 2
      if (i % 16 < 8) reed(ctx, bus, t, hz(n), beat * 0.55, 0.05)
      else pluck(ctx, bus, t, hz(n + 12), { gain: 0.12, decay: 0.6, pan: 0.2 })
    })
  } else if (style === 'dreamy') {
    const beat = 60 / 62
    const chords = [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]]
    for (let t = 0, c = 0; t < duration; t += beat * 4, c++) pad(ctx, bus, t, chords[c % 4].map((s) => hz(s - 12)), beat * 4.4, 0.025)
    const notes = melody(scale, Math.floor(duration / (beat / 2)), rnd, 8)
    notes.forEach((n, i) => {
      if (n === null || i % 2 === 1) return
      pluck(ctx, bus, 1 + (i * beat) / 2, hz(n + 12), { gain: 0.1, decay: 2.4, partials: [1, 0, 0.2, 0, 0.08], pan: (rnd() - 0.5) * 0.6 })
    })
  } else if (style === 'piano') {
    const beat = 60 / 72
    const chords = [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]]
    for (let bar = 0; bar * beat * 4 < duration; bar++) {
      const ch = chords[bar % 4]
      const t0 = bar * beat * 4
      pluck(ctx, bus, t0, hz(ch[0] - 24), { gain: 0.14, decay: 3, partials: [1, 0.25, 0.08] })
      const arp = [ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1], ch[2] + 12, ch[1]]
      arp.forEach((s, i) => pluck(ctx, bus, t0 + (i * beat) / 2, hz(s - 12), { gain: 0.08, decay: 1.8, partials: [1, 0.3, 0.1], pan: (i % 2 ? 0.2 : -0.2) }))
      if (bar % 2 === 1) pluck(ctx, bus, t0 + beat * 2, hz(ch[2] + rnd() * 2), { gain: 0.07, decay: 2, partials: [1, 0.2] })
    }
  } else {
    // royal: tanpura drone, santoor melody, gentle tabla theka
    const beat = 60 / 76
    tanpura(ctx, bus, 0, duration, 0.045)
    const notes = melody(scale, Math.floor((duration - 2) / (beat / 2)), rnd, 8)
    notes.forEach((n, i) => {
      if (n === null) return
      const t = 1.5 + (i * beat) / 2
      pluck(ctx, bus, t, hz(n), { gain: 0.16, decay: 1.6, partials: [1, 0.4, 0.15, 0.06], pan: -0.15 })
      // santoor tremolo-like double strike
      if (i % 4 === 3) pluck(ctx, bus, t + beat / 4, hz(n), { gain: 0.09, decay: 1.2, pan: 0.15 })
    })
    const theka = ['dha', 'na', 'na', 'dha', 'dha', 'na', 'na', 'dha']
    for (let t = 6, i = 0; t < duration - 1.5; t += beat, i++) drum(ctx, bus, noise, t, theka[i % 8], 0.55)
  }
  return ctx.startRendering()
}

/** Decode an uploaded audio file, resample, trim to `duration` and fade out. */
export async function prepareUploadedMusic(file, duration) {
  const bytes = await file.arrayBuffer()
  const tmp = new OfflineAudioContext(2, SAMPLE_RATE, SAMPLE_RATE)
  const decoded = await tmp.decodeAudioData(bytes)
  const ctx = new OfflineAudioContext(2, Math.ceil(SAMPLE_RATE * duration), SAMPLE_RATE)
  const src = ctx.createBufferSource()
  src.buffer = decoded
  src.loop = decoded.duration < duration
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, 0)
  g.gain.linearRampToValueAtTime(1, 0.8)
  g.gain.setValueAtTime(1, Math.max(0.9, duration - 2.5))
  g.gain.linearRampToValueAtTime(0, duration)
  src.connect(g).connect(ctx.destination)
  src.start(0)
  return ctx.startRendering()
}
