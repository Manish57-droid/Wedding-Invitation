import { useRef, useState } from 'react'
import { compressImage } from '../engine/assets.js'
import { MAX_EVENTS, eventStyle } from '../engine/format.js'
import { addDays } from '../state.js'

const NOTE_HINTS = {
  '🌼': 'e.g. Dress code: Yellow 💛',
  '🌿': 'e.g. Wear green 💚 · Mehendi artist on site',
  '🎶': "e.g. Come ready to dance 💃",
  '💞': 'e.g. Pheras at 9 PM sharp 🔥',
  '🥂': 'e.g. Dinner & DJ till late 🎉',
}

const EVENT_SUGGESTIONS = ['Haldi', 'Mehendi', 'Sangeet', 'Engagement', 'Wedding', 'Baraat', 'Reception', 'Cocktail', 'Puja', 'Tilak', 'Roka']

// [name, day offset from the wedding date, time]
const PRESETS = [
  { label: '💍 Only wedding', events: [['Wedding', 0, null]] },
  { label: '🌼 Haldi + Mehendi + Wedding', events: [['Haldi', -1, '10:00'], ['Mehendi', -1, '16:00'], ['Wedding', 0, null]] },
  { label: '🎶 Mehendi + Sangeet + Wedding', events: [['Mehendi', -1, '15:00'], ['Sangeet', -1, '19:00'], ['Wedding', 0, null]] },
  { label: '✨ Full celebration', events: [['Haldi', -2, '10:00'], ['Mehendi', -2, '16:00'], ['Sangeet', -1, '19:00'], ['Wedding', 0, null], ['Reception', 1, '20:00']] },
  { label: '🚫 No functions list', events: [] },
]

function Input({ label, hint, ...props }) {
  return (
    <label className="input">
      <span>{label}</span>
      {props.rows ? <textarea {...props} /> : <input {...props} />}
      {hint && <small>{hint}</small>}
    </label>
  )
}

/** One function: basic fields always visible, page extras (emoji, note, photo) behind a toggle. */
function EventCard({ ev, onChange, onUp, onDown, onRemove, showExtras }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)
  const style = eventStyle(ev.name)
  const icon = ev.emoji?.trim() || style.icon

  const onPhoto = async (file) => {
    if (!file) return
    setBusy(true)
    try {
      onChange({ image: await compressImage(file) })
    } catch {
      alert("Couldn't read that image. Try a JPG or PNG.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="event-card">
      <div className="event-row">
        <span className="ev-icon" aria-hidden="true">{icon}</span>
        <input className="ev-name" value={ev.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Function name" maxLength={28} aria-label="Function name" />
        <input type="date" value={ev.date} onChange={(e) => onChange({ date: e.target.value })} aria-label="Function date" />
        <input type="time" value={ev.time} onChange={(e) => onChange({ time: e.target.value })} aria-label="Function time" />
        <input className="ev-venue" value={ev.venue} onChange={(e) => onChange({ venue: e.target.value })} placeholder="Venue (optional)" maxLength={50} aria-label="Function venue" />
        <div className="ev-actions">
          <button type="button" className="icon-btn" onClick={onUp} aria-label="Move up">↑</button>
          <button type="button" className="icon-btn" onClick={onDown} aria-label="Move down">↓</button>
          <button type="button" className="icon-btn danger" onClick={onRemove} aria-label="Remove function">✕</button>
        </div>
      </div>
      {showExtras && (
        <>
          <button type="button" className="link-btn ev-more" onClick={() => setOpen((v) => !v)}>
            {open ? '▾ Hide page extras' : `▸ Page extras: emoji, note${ev.note ? ' ✓' : ''}, photo${ev.image ? ' ✓' : ''}`}
          </button>
          {open && (
            <div className="ev-extras">
              <div className="field">
                <span className="field-label">Emoji for this page</span>
                <div className="chips">
                  {[...new Set([style.icon, ...style.emojis, '🎉', '💖', '🪔', '🌸'])].map((e) => (
                    <button key={e} type="button" className={`chip emoji-chip ${icon === e ? 'on' : ''}`} onClick={() => onChange({ emoji: e })}>
                      {e}
                    </button>
                  ))}
                  <input className="emoji-input" value={ev.emoji || ''} onChange={(e) => onChange({ emoji: e.target.value })} placeholder="or type any" maxLength={4} aria-label="Custom emoji" />
                </div>
              </div>
              <label className="input">
                <span>Note on this page (dress code, theme, food…)</span>
                <input value={ev.note || ''} onChange={(e) => onChange({ note: e.target.value })} placeholder={NOTE_HINTS[style.icon] || 'e.g. Dress code: Pastels ✨'} maxLength={48} />
              </label>
              <div className="field">
                <span className="field-label">Photo for this page (optional, replaces the big emoji)</span>
                <div className="ev-photo">
                  {ev.image && <img src={ev.image} alt={`${ev.name} photo`} />}
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
                  <button type="button" className="btn ghost small" onClick={() => fileRef.current?.click()} disabled={busy}>
                    {busy ? 'Adding…' : ev.image ? 'Change photo' : '📷 Add photo'}
                  </button>
                  {ev.image && (
                    <button type="button" className="link-btn" onClick={() => onChange({ image: null })}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function DetailsStep({ data, update }) {
  const setEvent = (i, patch) => update((d) => ({ events: d.events.map((e, j) => (j === i ? { ...e, ...patch } : e)) }))
  const removeEvent = (i) => update((d) => ({ events: d.events.filter((_, j) => j !== i) }))
  const addEvent = (name = '') => update((d) => ({ events: [...d.events, { name, date: d.date, time: '', venue: '' }] }))
  const move = (i, dir) =>
    update((d) => {
      const ev = [...d.events]
      const j = i + dir
      if (j < 0 || j >= ev.length) return {}
      ;[ev[i], ev[j]] = [ev[j], ev[i]]
      return { events: ev }
    })
  const applyPreset = (p) =>
    update((d) => ({
      events: p.events.map(([name, offset, time]) => ({ name, date: addDays(d.date, offset), time: time ?? d.time, venue: '' })),
      scenes: { ...d.scenes, events: true },
    }))
  const unused =EVENT_SUGGESTIONS.filter((s) => !data.events.some((e) => e.name.toLowerCase() === s.toLowerCase()))

  return (
    <section>
      <div className="section-head">
        <h1>Wedding details</h1>
        <p>Everything here appears in the video. Leave a field empty to skip that part.</p>
      </div>

      <div className="card">
        <h2>The big day</h2>
        <div className="grid-2">
          <Input label="Wedding date" type="date" value={data.date} onChange={(e) => update({ date: e.target.value })} />
          <Input label="Muhurat / start time" type="time" value={data.time} onChange={(e) => update({ time: e.target.value })} />
          <Input label="Venue name" value={data.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="The Royal Palms" maxLength={60} />
          <Input label="Address / city" value={data.address} onChange={(e) => update({ address: e.target.value })} placeholder="Lake Road, Udaipur" maxLength={90} />
        </div>
      </div>

      <div className="card">
        <h2>Invitation wording</h2>
        <div className="grid-2">
          <Input label="With the blessings of (optional)" value={data.blessings} onChange={(e) => update({ blessings: e.target.value })} placeholder="Grandparents / elders" maxLength={90} />
          <Input label="Invitation line" value={data.inviteLine} onChange={(e) => update({ inviteLine: e.target.value })} maxLength={90} />
          <Input label="Closing message" value={data.closing} onChange={(e) => update({ closing: e.target.value })} maxLength={110} />
          <Input label="Wedding hashtag" value={data.hashtag} onChange={(e) => update({ hashtag: e.target.value })} placeholder="#ManuWedsJyoti" maxLength={32} />
          <Input label="RSVP" value={data.rsvp} onChange={(e) => update({ rsvp: e.target.value })} placeholder="Name · phone" maxLength={70} />
        </div>
        <div className="toggles">
          <label className="toggle">
            <input type="checkbox" checked={data.showInvocation} onChange={(e) => update({ showInvocation: e.target.checked })} />
            <span>Open with “॥ श्री गणेशाय नमः ॥”</span>
          </label>
          <label className="toggle">
            <input type="checkbox" checked={data.includePhotos} onChange={(e) => update({ includePhotos: e.target.checked })} />
            <span>Show your real photos near the end</span>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Functions</h2>
          <span className="muted">{data.events.length ? `${Math.min(data.events.length, data.eventLayout === 'list' ? 6 : MAX_EVENTS)} shown in video` : 'No functions in video'}</span>
        </div>
        <p className="muted">Every family does it differently. Start from a preset, then rename, re-order, remove (✕) or add your own.</p>
        <div className="chips presets">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className="chip" onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="field">
          <span className="field-label">How functions appear in the video</span>
          <div className="chips">
            <button type="button" className={`chip ${data.eventLayout !== 'list' ? 'on' : ''}`} onClick={() => update({ eventLayout: 'pages' })}>
              📄 A page for each function
            </button>
            <button type="button" className={`chip ${data.eventLayout === 'list' ? 'on' : ''}`} onClick={() => update({ eventLayout: 'list' })}>
              📋 All on one page
            </button>
          </div>
        </div>
        <div className="events">
          {data.events.map((ev, i) => (
            <EventCard
              key={i}
              ev={ev}
              onChange={(patch) => setEvent(i, patch)}
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              onRemove={() => removeEvent(i)}
              showExtras={data.eventLayout !== 'list'}
            />
          ))}
        </div>
        {data.events.length < MAX_EVENTS && (
          <div className="chips">
            {unused.slice(0, 6).map((s) => (
              <button key={s} type="button" className="chip" onClick={() => addEvent(s)}>
                + {s}
              </button>
            ))}
            <button type="button" className="chip" onClick={() => addEvent('')}>
              + Custom
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
