import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, TEMPLATES } from '../engine/templates/index.js'
import { useInvitation } from '../hooks/useInvitation.js'
import CustomizePanel from './CustomizePanel.jsx'

/**
 * Animated thumbnail. Only animates while on screen and the tab is visible,
 * at a reduced frame rate, so six previews stay light on phones.
 */
function Thumb({ invitation }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!invitation) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    // skip the slow-starting intro so the thumbnail shows the couple quickly
    const offset = invitation.scenes.find((s) => s.id === 'couple')?.start ?? 0
    let raf = 0
    let last = 0
    let visible = false
    let elapsed = 2.5
    let prev = performance.now()
    invitation.render(ctx, offset + elapsed)

    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 66) return
      elapsed += Math.min(0.1, (now - prev) / 1000)
      prev = now
      last = now
      invitation.render(ctx, (offset + elapsed) % invitation.duration)
    }
    const sync = () => {
      const run = visible && !document.hidden
      if (run && !raf) {
        prev = performance.now()
        raf = requestAnimationFrame(loop)
      } else if (!run && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      cancelAnimationFrame(raf)
    }
  }, [invitation])
  return <canvas ref={ref} width={270} height={480} className="thumb-canvas" />
}

function TemplateCard({ template, data, selected, onSelect }) {
  const { invitation } = useInvitation({ ...data, templateId: template.id, showInvocation: false }, 300)
  return (
    <button className={`template-card ${selected ? 'selected' : ''}`} onClick={onSelect} aria-pressed={selected}>
      <div className="thumb">
        {invitation ? <Thumb invitation={invitation} /> : <div className="thumb-loading">Loading…</div>}
        {selected && <span className="badge thumb-badge">✓ Selected</span>}
      </div>
      <div className="template-meta">
        <h3>{template.name}</h3>
        <p>{template.description}</p>
      </div>
    </button>
  )
}

export default function TemplateStep({ data, update }) {
  const [cat, setCat] = useState('all')
  const shown = TEMPLATES.filter((t) => cat === 'all' || t.category === cat)
  return (
    <section>
      <div className="section-head">
        <h1>Choose your invitation style</h1>
        <p>Every template turns your photos into cartoon avatars and animates your details into a video ready for WhatsApp and Instagram.</p>
      </div>
      <div className="chips cat-filter" role="tablist">
        {CATEGORIES.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={cat === id} className={`chip ${cat === id ? 'on' : ''}`} onClick={() => setCat(id)}>
            {label} <span className="count">{id === 'all' ? TEMPLATES.length : TEMPLATES.filter((t) => t.category === id).length}</span>
          </button>
        ))}
      </div>
      <div className="template-grid">
        {shown.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            data={data}
            selected={data.templateId === t.id}
            // colours belong to a template, so switching resets them; custom wording is kept
            onSelect={() => update((d) => ({ templateId: t.id, showInvocation: t.id !== 'minimal' ? d.showInvocation : false, custom: { ...d.custom, accent: '', heading: '' } }))}
          />
        ))}
      </div>
      <CustomizePanel data={data} update={update} />
    </section>
  )
}
