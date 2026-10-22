import { getTemplate } from '../engine/templates/index.js'

const TEXT_FIELDS = [
  ['main', 'Main title', (t) => t.tagline.main],
  ['deva', 'Hindi title (clear to hide)', (t) => t.tagline.deva],
  ['sub', 'Subtitle', (t) => t.tagline.sub],
  ['coupleLine', 'Line under names', (t) => t.coupleLine],
  ['dateHeading', 'Date heading', (t) => t.dateHeading],
  ['eventsHeading', 'Functions heading', (t) => t.eventsHeading],
  ['thanks', 'Last line', (t) => t.thanks],
]

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
  const custom = data.custom
  const setCustom = (patch) => update((d) => ({ custom: { ...d.custom, ...patch } }))
  const setText = (k, v) => update((d) => ({ custom: { ...d.custom, texts: { ...d.custom.texts, [k]: v } } }))
  const isOn = ([k, , where]) => (where === 'root' ? !!data[k] : data.scenes?.[k] !== false)
  const toggle = ([k, , where], v) => (where === 'root' ? update({ [k]: v }) : update((d) => ({ scenes: { ...d.scenes, [k]: v } })))

  return (
    <details className="card customize">
      <summary>
        <span>
          <h2>Customise “{tpl.name}”</h2>
          <small className="muted">Titles, colours and which sections appear</small>
        </span>
        <span className="chev" aria-hidden="true">▾</span>
      </summary>
      <button type="button" className="link-btn reset" onClick={() => update({ custom: { accent: '', heading: '', texts: {} } })}>
        Reset wording & colours
      </button>

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

      <div className="grid-2">
        {TEXT_FIELDS.map(([k, label, def]) => (
          <label key={k} className="input">
            <span>{label}</span>
            <input
              value={k === 'deva' ? (custom.texts?.deva ?? tpl.tagline.deva) : (custom.texts?.[k] ?? '')}
              placeholder={k === 'deva' ? 'e.g. शुभ विवाह (empty = hidden)' : def(tpl)} onChange={(e) => setText(k, e.target.value)} maxLength={k === 'deva' ? 24 : 60} />
          </label>
        ))}
      </div>

      <div className="grid-2">
        <ColorRow label="Title colour" value={custom.heading} fallback={tpl.palette.heading} onChange={(heading) => setCustom({ heading })} />
        <ColorRow label="Accent colour" value={custom.accent} fallback={tpl.palette.accent} onChange={(accent) => setCustom({ accent })} />
      </div>
    </details>
  )
}
