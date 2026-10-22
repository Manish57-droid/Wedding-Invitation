import { useEffect, useRef, useState } from 'react'
import { MUSIC_STYLES, generateMusic, prepareUploadedMusic } from '../audio/music.js'
import { getTemplate } from '../engine/templates/index.js'
import { canExportMp4, exportVideo } from '../export/exportVideo.js'
import { useInvitation } from '../hooks/useInvitation.js'

function useMusic(music, templateId, duration, uploadFile) {
  const [state, setState] = useState({ buffer: null, loading: false, error: null })
  const style = music.style === 'auto' ? getTemplate(templateId).music : music.style
  const dur = duration ? Math.ceil(duration * 10) / 10 : 0

  useEffect(() => {
    if (!dur || music.mode === 'none' || (music.mode === 'upload' && !uploadFile)) {
      setState({ buffer: null, loading: false, error: null })
      return
    }
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    const job = music.mode === 'upload' ? prepareUploadedMusic(uploadFile, dur) : generateMusic(style, dur)
    job.then(
      (buffer) => !cancelled && setState({ buffer, loading: false, error: null }),
      (error) => !cancelled && setState({ buffer: null, loading: false, error }),
    )
    return () => {
      cancelled = true
    }
  }, [music.mode, style, dur, uploadFile])

  return state
}

function fmt(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function Player({ invitation, audioBuffer, disabled }) {
  const canvasRef = useRef(null)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef({ ctx: null, src: null })
  // offset = position when playback (re)started; tNow mirrors t for effects that restart mid-play
  const clock = useRef({ start: 0, offset: 0, tNow: 0 })

  const stopAudio = () => {
    try {
      audioRef.current.src?.stop()
    } catch {
      // already stopped
    }
    audioRef.current.src = null
  }

  useEffect(() => {
    if (!invitation || !canvasRef.current) return
    // frame 0 is a fade from black, so show the couple as a poster before playback starts
    const poster = (invitation.scenes.find((s) => s.id === 'couple')?.start ?? 0) + 4.5
    invitation.render(canvasRef.current.getContext('2d'), t === 0 && !playing ? poster : t)
  }, [invitation, t, playing])

  useEffect(() => {
    if (!playing || !invitation) return
    let raf
    // resume from wherever we are (e.g. the music finished generating mid-play)
    clock.current.offset = clock.current.tNow
    clock.current.start = performance.now() / 1000
    const loop = () => {
      const time = clock.current.offset + (performance.now() / 1000 - clock.current.start)
      if (time >= invitation.duration) {
        setPlaying(false)
        stopAudio()
        clock.current.tNow = 0
        setT(0)
        return
      }
      clock.current.tNow = time
      setT(time)
      raf = requestAnimationFrame(loop)
    }
    const a = audioRef.current
    if (audioBuffer && a.ctx) {
      stopAudio()
      const src = a.ctx.createBufferSource()
      src.buffer = audioBuffer
      src.connect(a.ctx.destination)
      src.start(0, Math.min(clock.current.offset, audioBuffer.duration))
      a.src = src
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      stopAudio()
    }
  }, [playing, invitation, audioBuffer])

  useEffect(() => () => audioRef.current.ctx?.close(), [])

  const toggle = () => {
    clock.current.tNow = t
    if (!playing) {
      // create / resume audio inside the click so autoplay policies allow it
      const a = audioRef.current
      if (!a.ctx) a.ctx = new AudioContext()
      a.ctx.resume()
    }
    setPlaying(!playing)
  }

  const seek = (v) => {
    clock.current.tNow = v
    setT(v)
    if (playing) {
      setPlaying(false)
      requestAnimationFrame(() => setPlaying(true))
    }
  }

  return (
    <div className="player">
      <div className="phone">
        <canvas ref={canvasRef} width={540} height={960} />
        {!invitation && <div className="phone-loading">Preparing preview…</div>}
      </div>
      <div className="player-controls">
        <button className="btn primary round" onClick={toggle} disabled={!invitation || disabled} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <input type="range" min={0} max={invitation?.duration || 1} step={0.01} value={t} onChange={(e) => seek(Number(e.target.value))} disabled={!invitation} aria-label="Seek" />
        <span className="time">
          {fmt(t)} / {fmt(invitation?.duration || 0)}
        </span>
      </div>
    </div>
  )
}

export default function PreviewStep({ data, update }) {
  const { invitation, error } = useInvitation(data)
  const [uploadFile, setUploadFile] = useState(null)
  const music = useMusic(data.music, data.templateId, invitation?.duration, uploadFile)
  const [exporting, setExporting] = useState(null)
  const [result, setResult] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => () => result && URL.revokeObjectURL(result.url), [result])

  const setMusic = (patch) => update((d) => ({ music: { ...d.music, ...patch } }))

  const fileName = `${(data.groom.name || 'groom').trim()}-weds-${(data.bride.name || 'bride').trim()}`.replace(/[^\w-]+/g, '-').toLowerCase()

  const startExport = async () => {
    if (!invitation) return
    setResult(null)
    const ac = new AbortController()
    abortRef.current = ac
    setExporting({ progress: 0 })
    try {
      const out = await exportVideo({ invitation, audioBuffer: music.buffer, signal: ac.signal, onProgress: (p) => setExporting({ progress: p }) })
      setResult({ ...out, url: URL.createObjectURL(out.blob), name: `${fileName}.${out.ext}` })
      // on phones the result appears below the fold
      setTimeout(() => document.querySelector('.result')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
    } catch (e) {
      if (e.name !== 'AbortError') alert(`Video export failed: ${e.message}`)
    } finally {
      setExporting(null)
    }
  }

  const share = async () => {
    const file = new File([result.blob], result.name, { type: result.blob.type })
    try {
      await navigator.share({ files: [file], title: `${data.groom.name} & ${data.bride.name} – Wedding Invitation` })
    } catch {
      // user cancelled
    }
  }
  const canShare = result && typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([result.blob], result.name, { type: result.blob.type })] })

  return (
    <section className="preview-step">
      <div className="section-head">
        <h1>Preview & download</h1>
        <p>Press play to watch your invitation. When it looks right, create the video. Rendering happens on your device, no upload needed.</p>
      </div>
      {error && <p className="status warn">Preview error: {error.message}</p>}
      <div className="preview-layout">
        <Player invitation={invitation} audioBuffer={music.buffer} disabled={!!exporting} />

        <div className="side-panel">
          <div className="card">
            <h2>Background music</h2>
            <div className="chips">
              {[
                ['generated', '🎵 Built-in'],
                ['upload', '📁 My song'],
                ['none', '🔇 None'],
              ].map(([id, label]) => (
                <button key={id} className={`chip ${data.music.mode === id ? 'on' : ''}`} onClick={() => setMusic({ mode: id })}>
                  {label}
                </button>
              ))}
            </div>
            {data.music.mode === 'generated' && (
              <label className="input">
                <span>Style</span>
                <select value={data.music.style} onChange={(e) => setMusic({ style: e.target.value })}>
                  <option value="auto">Match template</option>
                  {MUSIC_STYLES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <small>Original royalty-free music, composed in your browser.</small>
              </label>
            )}
            {data.music.mode === 'upload' && (
              <label className="input">
                <span>Audio file (MP3, M4A, WAV…)</span>
                <input type="file" accept="audio/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                <small>Make sure you have the rights to use the song. It's trimmed to fit and faded out.</small>
              </label>
            )}
            {music.loading && <p className="status busy">Preparing music…</p>}
            {music.error && <p className="status warn">Couldn't load that audio: {music.error.message}</p>}
          </div>

          <div className="card export-card">
            <h2>Your video</h2>
            <p className="muted">
              1080×1920 vertical MP4, about {Math.round(invitation?.duration || 0)}s. Perfect for WhatsApp, Instagram Stories and Reels.
              {!canExportMp4() && ' Your browser will record in real time, which takes as long as the video. Chrome or Edge is faster.'}
            </p>
            {exporting ? (
              <div className="progress-wrap">
                <div className="progress">
                  <div style={{ width: `${Math.round(exporting.progress * 100)}%` }} />
                </div>
                <small className="muted">Keep this screen open until it finishes.</small>
                <div className="progress-row">
                  <span>Rendering… {Math.round(exporting.progress * 100)}%</span>
                  <button className="link-btn" onClick={() => abortRef.current?.abort()}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn primary big" onClick={startExport} disabled={!invitation || music.loading}>
                ✨ Create my video
              </button>
            )}
            {result && (
              <div className="result">
                <video src={result.url} controls playsInline />
                <div className="result-actions">
                  {canShare && (
                    <button className="btn primary" onClick={share}>
                      📤 Share to WhatsApp / Instagram
                    </button>
                  )}
                  <a className={`btn ${canShare ? 'ghost' : 'primary'}`} href={result.url} download={result.name}>
                    ⬇ Download {result.ext.toUpperCase()}
                  </a>
                </div>
                <small className="muted">
                  {(result.blob.size / 1024 / 1024).toFixed(1)} MB · {result.width}×{result.height}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
