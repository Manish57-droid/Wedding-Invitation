import { ArrayBufferTarget, Muxer } from 'mp4-muxer'

const FPS = 30

const VIDEO_CANDIDATES = [
  { w: 1080, h: 1920, codecs: ['avc1.640033', 'avc1.640028', 'avc1.4d0033', 'avc1.4d0028', 'avc1.42003e', 'avc1.420034'], bitrate: 3_500_000 },
  { w: 720, h: 1280, codecs: ['avc1.64001f', 'avc1.4d001f', 'avc1.42001f'], bitrate: 2_500_000 },
]

export function canExportMp4() {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window
}

async function pickVideoConfig() {
  for (const cand of VIDEO_CANDIDATES) {
    for (const codec of cand.codecs) {
      const config = { codec, width: cand.w, height: cand.h, bitrate: cand.bitrate, framerate: FPS, avc: { format: 'avc' } }
      try {
        const res = await VideoEncoder.isConfigSupported(config)
        if (res.supported) return config
      } catch {
        // try the next one
      }
    }
  }
  return null
}

async function pickAudioConfig(sampleRate) {
  if (!('AudioEncoder' in window)) return null
  for (const [codec, muxCodec] of [['mp4a.40.2', 'aac'], ['opus', 'opus']]) {
    const config = { codec, sampleRate, numberOfChannels: 2, bitrate: 160_000 }
    try {
      const res = await AudioEncoder.isConfigSupported(config)
      if (res.supported) return { config, muxCodec }
    } catch {
      // try the next one
    }
  }
  return null
}

/**
 * Render every frame offline with WebCodecs and mux into an MP4 (H.264 + AAC).
 * Faster than real time on most devices and frame-perfect.
 */
export async function exportMp4({ invitation, audioBuffer, onProgress, signal }) {
  const vConf = await pickVideoConfig()
  if (!vConf) throw new Error('This browser cannot encode H.264 video')
  const aConf = audioBuffer ? await pickAudioConfig(audioBuffer.sampleRate) : null

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: vConf.width, height: vConf.height, frameRate: FPS },
    audio: aConf ? { codec: aConf.muxCodec, sampleRate: audioBuffer.sampleRate, numberOfChannels: 2 } : undefined,
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
  })

  let failure = null
  const venc = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => (failure = e),
  })
  venc.configure(vConf)

  const canvas = document.createElement('canvas')
  canvas.width = vConf.width
  canvas.height = vConf.height
  const ctx = canvas.getContext('2d', { alpha: false })

  const total = Math.ceil(invitation.duration * FPS)
  const frameUs = 1e6 / FPS
  for (let i = 0; i < total; i++) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    if (failure) throw failure
    invitation.render(ctx, i / FPS)
    const frame = new VideoFrame(canvas, { timestamp: Math.round(i * frameUs), duration: Math.round(frameUs) })
    venc.encode(frame, { keyFrame: i % (FPS * 2) === 0 })
    frame.close()
    if (venc.encodeQueueSize > 8) {
      await new Promise((r) => {
        const check = () => (venc.encodeQueueSize <= 4 || failure ? r() : setTimeout(check, 4))
        check()
      })
    }
    if (i % 5 === 0) {
      onProgress?.((i / total) * (aConf ? 0.95 : 1))
      // yield so the UI can repaint the progress bar
      await new Promise((r) => setTimeout(r, 0))
    }
  }
  await venc.flush()
  venc.close()
  if (failure) throw failure

  if (aConf) {
    const aenc = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => (failure = e),
    })
    aenc.configure(aConf.config)
    const sr = audioBuffer.sampleRate
    const length = Math.min(audioBuffer.length, Math.ceil(invitation.duration * sr))
    const L = audioBuffer.getChannelData(0)
    const R = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : L
    const block = 4096
    for (let off = 0; off < length; off += block) {
      const n = Math.min(block, length - off)
      const planar = new Float32Array(n * 2)
      planar.set(L.subarray(off, off + n), 0)
      planar.set(R.subarray(off, off + n), n)
      const data = new AudioData({ format: 'f32-planar', sampleRate: sr, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((off / sr) * 1e6), data: planar })
      aenc.encode(data)
      data.close()
    }
    await aenc.flush()
    aenc.close()
    if (failure) throw failure
  }

  muxer.finalize()
  onProgress?.(1)
  return { blob: new Blob([muxer.target.buffer], { type: 'video/mp4' }), ext: 'mp4', width: vConf.width, height: vConf.height }
}

/**
 * Fallback for browsers without WebCodecs: play the animation in real time and
 * record the canvas with MediaRecorder (usually WebM).
 */
export async function exportRealtime({ invitation, audioBuffer, onProgress, signal }) {
  const canvas = document.createElement('canvas')
  canvas.width = 720
  canvas.height = 1280
  const ctx = canvas.getContext('2d', { alpha: false })
  invitation.render(ctx, 0)
  const stream = canvas.captureStream(FPS)
  let audioCtx = null
  if (audioBuffer) {
    audioCtx = new AudioContext({ sampleRate: audioBuffer.sampleRate })
    const dest = audioCtx.createMediaStreamDestination()
    const src = audioCtx.createBufferSource()
    src.buffer = audioBuffer
    src.connect(dest)
    dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr))
    src.start()
  }
  const types = ['video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
  const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) || ''
  const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 })
  const chunks = []
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  const done = new Promise((r) => (rec.onstop = r))
  rec.start(250)
  const t0 = performance.now()
  await new Promise((resolve, reject) => {
    const tick = () => {
      if (signal?.aborted) return reject(new DOMException('Cancelled', 'AbortError'))
      const t = (performance.now() - t0) / 1000
      if (t >= invitation.duration) return resolve()
      invitation.render(ctx, t)
      onProgress?.(t / invitation.duration)
      requestAnimationFrame(tick)
    }
    tick()
  }).finally(() => {
    rec.stop()
    audioCtx?.close()
  })
  await done
  const type = rec.mimeType || mimeType || 'video/webm'
  return { blob: new Blob(chunks, { type }), ext: type.includes('mp4') ? 'mp4' : 'webm', width: 720, height: 1280 }
}

export async function exportVideo(opts) {
  if (canExportMp4()) {
    try {
      return await exportMp4(opts)
    } catch (e) {
      if (e.name === 'AbortError') throw e
      console.warn('WebCodecs export failed, falling back to real-time recording', e)
    }
  }
  return exportRealtime(opts)
}
