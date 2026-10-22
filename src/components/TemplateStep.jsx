import { useEffect, useRef } from 'react'
import { TEMPLATES } from '../engine/templates/index.js'
import { useInvitation } from '../hooks/useInvitation.js'
import CustomizePanel from './CustomizePanel.jsx'

/** Animated thumbnail; renders at reduced frame rate to stay light. */
function Thumb({ invitation }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!invitation) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf
    let last = 0
    const start = performance.now()
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 50) return
      last = now
      // skip the slow-starting intro so the thumbnail shows the couple quickly
      const offset = invitation.scenes.find((s) => s.id === 'couple')?.start ?? 0
      const t = (offset + (now - start) / 1000) % invitation.duration
      invitation.render(ctx, t)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [invitation])
  return <canvas ref={ref} width={270} height={480} className="thumb-canvas" />
}

function TemplateCard({ template, data, selected, onSelect }) {
  const { invitation } = useInvitation({ ...data, templateId: template.id, showInvocation: false }, 300)
  return (
    <button className={`template-card ${selected ? 'selected' : ''}`} onClick={onSelect} aria-pressed={selected}>
      <div className="thumb">{invitation ? <Thumb invitation={invitation} /> : <div className="thumb-loading">Loading…</div>}</div>
      <div className="template-meta">
        <h3>
          {template.name} {selected && <span className="badge">Selected</span>}
        </h3>
        <p>{template.description}</p>
      </div>
    </button>
  )
}

export default function TemplateStep({ data, update }) {
  return (
    <section>
      <div className="section-head">
        <h1>Choose your invitation style</h1>
        <p>Every template turns your photos into cartoon avatars and animates your details into a video ready for WhatsApp and Instagram.</p>
      </div>
      <div className="template-grid">
        {TEMPLATES.map((t) => (
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
