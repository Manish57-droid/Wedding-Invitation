import { TEXT_LABELS, templateTexts } from '../engine/templates/base.js'
import { getTemplate } from '../engine/templates/index.js'

const ACCENTS = ['#d4a64a', '#e63946', '#3a86ff', '#ff70a6', '#0f5c46', '#b5835a', '#7b2cbf', '#f2c14e']

const SECTIONS = [
  ['showInvocation', 'Ganesh invocation', 'root'],
  ['families', 'Families & blessings', 'scenes'],
  ['dateVenue', 'Date & venue', 'scenes'],
  ['events', 'Functions list', 'scenes'],
  ['includePhotos', 'Real photos', 'root'],
]

function ColorRow({ label, value, fallback, onChange }) {
  return (
    <div className="field">
      <span className="field-label">
        {label}{' '}
        {value && (
          <button type="button" className="link-btn" onClick={() => onChange('')}>
            reset
          </button>
        )}
      </span>
      <div className="swatches">
        {ACCENTS.map((c) => (
          <button key={c} type="button" className={`swatch ${(value || fallback) === c ? 'on' : ''}`} style={{ background: c }} onClick={() => onChange(c)} aria-label={`${label} ${c}`} />
        ))}
        <label className="swatch custom" title="Custom colour">
          <input type="color" value={value || fallback} onChange={(e) => onChange(e.target.value)} />
          <span>+</span>
        </label>
      </div>
    </div>
  )
}

export default function CustomizePanel({ data, update }) {
  const tpl = getTemplate(data.templateId)
  const defaults = templateTexts(tpl)
  const custom = data.custom
  const fields = [...(tpl.textLabels || []), ...TEXT_LABELS].filter(([k]) => k in defaults && !tpl.hideTexts?.includes(k))
  const setCustom = (patch) => update((d) => ({ custom: { ...d.custom, ...patch } }))
  const setText = (k, v) => update((d) => ({ custom: { ...d.custom, texts: { ...d.custom.texts, [k]: v } } }))
  const isOn = ([k, , where]) => (where === 'root' ? !!data[k] : data.scenes?.[k] !== false)
  const toggle = ([k, , where], v) => (where === 'root' ? update({ [k]: v }) : update((d) => ({ scenes: { ...d.scenes, [k]: v } })))

  return (
    <details className="card customize">
      <summary>
        <span>
          <h2>Customise “{tpl.name}”</h2>
          <small className="muted">Every text line, colours and which sections appear</small>
        </span>
        <span className="chev" aria-hidden="true">▾</span>
      </summary>

      <div className="field">
        <span className="field-label">Sections in the video</span>
        <div className="toggles">
          {SECTIONS.map((s) => (
            <label key={s[0]} className="toggle">
              <input type="checkbox" checked={isOn(s)} onChange={(e) => toggle(s, e.target.checked)} />
              <span>{s[1]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card-head">
        <span className="field-label">Text in the video · empty a box to hide that line</span>
        <button type="button" className="link-btn" onClick={() => setCustom({ texts: {} })}>
          Reset text
        </button>
      </div>
      <div className="grid-2">
        {fields.map(([k, label]) => {
          const edited = typeof custom.texts?.[k] === 'string' && custom.texts[k] !== defaults[k]
          return (
            <label key={k} className={`input ${edited ? 'edited' : ''}`}>
              <span>
                {label}
                {edited && (
                  <button type="button" className="link-btn undo" onClick={(e) => (e.preventDefault(), setText(k, defaults[k]))}>
                    undo
                  </button>
                )}
              </span>
              <input value={custom.texts?.[k] ?? defaults[k]} placeholder="(hidden)" onChange={(e) => setText(k, e.target.value)} maxLength={70} />
            </label>
          )
        })}
      </div>

      <div className="grid-2">
        <ColorRow label="Title colour" value={custom.heading} fallback={tpl.palette.heading} onChange={(heading) => setCustom({ heading })} />
        <ColorRow label="Accent colour" value={custom.accent} fallback={tpl.palette.accent} onChange={(accent) => setCustom({ accent })} />
      </div>
    </details>
  )
}
