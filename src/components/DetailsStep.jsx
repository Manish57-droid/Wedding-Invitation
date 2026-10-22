import { addDays } from '../state.js'

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
          <Input label="Wedding hashtag" value={data.hashtag} onChange={(e) => update({ hashtag: e.target.value })} placeholder="#AaravWedsDiya" maxLength={32} />
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
          <span className="muted">{data.events.length ? `${Math.min(data.events.length, 6)} shown in video` : 'No functions list in video'}</span>
        </div>
        <p className="muted">Every family does it differently. Start from a preset, then rename, re-order, remove (✕) or add your own.</p>
        <div className="chips presets">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className="chip" onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="events">
          {data.events.map((ev, i) => (
            <div className="event-row" key={i}>
              <input className="ev-name" value={ev.name} onChange={(e) => setEvent(i, { name: e.target.value })} placeholder="Event name" maxLength={28} aria-label="Event name" />
              <input type="date" value={ev.date} onChange={(e) => setEvent(i, { date: e.target.value })} aria-label="Event date" />
              <input type="time" value={ev.time} onChange={(e) => setEvent(i, { time: e.target.value })} aria-label="Event time" />
              <input className="ev-venue" value={ev.venue} onChange={(e) => setEvent(i, { venue: e.target.value })} placeholder="Venue (optional)" maxLength={50} aria-label="Event venue" />
              <div className="ev-actions">
                <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button type="button" className="icon-btn" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                <button type="button" className="icon-btn danger" onClick={() => removeEvent(i)} aria-label="Remove event">✕</button>
              </div>
            </div>
          ))}
        </div>
        {data.events.length < 6 && (
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
