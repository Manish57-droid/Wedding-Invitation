import { useMemo, useRef, useState } from 'react'
import { analyzeFace, loadImageFromFile } from '../avatar/analyzeFace.js'
import { buildAvatarSvg } from '../avatar/buildAvatarSvg.js'
import AvatarEditor from './AvatarEditor.jsx'

function AvatarPreview({ cfg }) {
  const src = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildAvatarSvg(cfg))}`, [cfg])
  return <img className="avatar-img" src={src} alt="Cartoon avatar preview" />
}

function PersonCard({ who, person, onChange }) {
  const [status, setStatus] = useState(null)
  const [editing, setEditing] = useState(false)
  const fileRef = useRef(null)
  const title = who === 'groom' ? 'Groom' : 'Bride'

  const onFile = async (file) => {
    if (!file) return
    setStatus({ kind: 'busy', text: 'Reading face features…' })
    try {
      const img = await loadImageFromFile(file)
      const res = await analyzeFace(img, who)
      URL.revokeObjectURL(img.src)
      onChange({ ...person, photo: res.crop, avatar: { ...person.avatar, ...res.overrides } })
      setStatus(
        res.found
          ? { kind: 'ok', text: 'Avatar created from the photo. Fine-tune it below if anything looks off.' }
          : { kind: 'warn', text: "Couldn't find a clear face, so I picked a skin tone. Try a front-facing, well-lit photo, or customise below." },
      )
      setEditing(true)
    } catch (e) {
      setStatus({ kind: 'warn', text: e.message || 'Something went wrong reading that photo.' })
    }
  }

  return (
    <div className="person-card">
      <div className="person-head">
        <h2>{title}</h2>
        <span className={`role-dot ${who}`} />
      </div>
      <div className="person-body">
        <div className="avatar-col">
          <div className="avatar-frame">
            <AvatarPreview cfg={person.avatar} />
            {person.photo && <img className="photo-chip" src={person.photo} alt={`${title} photo`} />}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <button className="btn primary small" onClick={() => fileRef.current?.click()} disabled={status?.kind === 'busy'}>
            {status?.kind === 'busy' ? 'Analysing…' : person.photo ? 'Change photo' : `Upload ${title.toLowerCase()} photo`}
          </button>
          {status && <p className={`status ${status.kind}`}>{status.text}</p>}
        </div>
        <div className="fields">
          <label className="input">
            <span>{title}'s name</span>
            <input value={person.name} onChange={(e) => onChange({ ...person, name: e.target.value })} placeholder={who === 'groom' ? 'Manu Kushwaha' : 'Jyoti Kumari'} maxLength={40} />
          </label>
          <label className="input">
            <span>Parents (optional)</span>
            <input value={person.parents} onChange={(e) => onChange({ ...person, parents: e.target.value })} placeholder="Mr. & Mrs. Kushwaha" maxLength={80} />
          </label>
          <button className="link-btn" onClick={() => setEditing((v) => !v)}>
            {editing ? '▾ Hide avatar options' : '▸ Customise avatar'}
          </button>
        </div>
      </div>
      {editing && <AvatarEditor cfg={person.avatar} onChange={(avatar) => onChange({ ...person, avatar })} />}
    </div>
  )
}

export default function CoupleStep({ data, update }) {
  return (
    <section>
      <div className="section-head">
        <h1>Meet the couple</h1>
        <p>Upload a clear, front-facing photo of each of you. We read skin tone, hair colour, face shape and beard to design matching cartoon avatars, entirely in your browser.</p>
      </div>
      <div className="couple-grid">
        <PersonCard who="groom" person={data.groom} onChange={(groom) => update({ groom })} />
        <PersonCard who="bride" person={data.bride} onChange={(bride) => update({ bride })} />
      </div>
    </section>
  )
}
