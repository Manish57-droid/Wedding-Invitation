import {
  ACCENT_COLORS,
  BEARDS,
  BRIDE_HAIR,
  BRIDE_HEADWEAR,
  BRIDE_OUTFITS,
  BRIDE_OUTFIT_COLORS,
  FACE_SHAPES,
  GROOM_HAIR,
  GROOM_HEADWEAR,
  GROOM_OUTFITS,
  GROOM_OUTFIT_COLORS,
  HAIR_COLORS,
  LIP_COLORS,
  SKIN_TONES,
} from '../avatar/options.js'

function Swatches({ label, value, colors, onChange }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="swatches">
        {colors.map((c) => (
          <button key={c} type="button" className={`swatch ${value === c ? 'on' : ''}`} style={{ background: c }} onClick={() => onChange(c)} aria-label={`${label} ${c}`} />
        ))}
        <label className="swatch custom" title="Custom colour">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
          <span>+</span>
        </label>
      </div>
    </div>
  )
}

function Chips({ label, value, options, onChange }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="chips">
        {options.map((o) => (
          <button key={o.id} type="button" className={`chip ${value === o.id ? 'on' : ''}`} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

export default function AvatarEditor({ cfg, onChange }) {
  const set = (k) => (v) => onChange({ ...cfg, [k]: v })
  const groom = cfg.role === 'groom'
  return (
    <div className="avatar-editor">
      <Swatches label="Skin tone" value={cfg.skin} colors={SKIN_TONES} onChange={set('skin')} />
      <Chips label="Face shape" value={cfg.faceShape} options={FACE_SHAPES} onChange={set('faceShape')} />
      <Swatches label="Hair colour" value={cfg.hair} colors={HAIR_COLORS} onChange={set('hair')} />
      <Chips label="Hairstyle" value={cfg.hairStyle} options={groom ? GROOM_HAIR : BRIDE_HAIR} onChange={set('hairStyle')} />
      {groom && <Chips label="Beard" value={cfg.beard} options={BEARDS} onChange={set('beard')} />}
      <Chips label="Outfit" value={cfg.outfit} options={groom ? GROOM_OUTFITS : BRIDE_OUTFITS} onChange={set('outfit')} />
      <Swatches label="Outfit colour" value={cfg.outfitColor} colors={groom ? GROOM_OUTFIT_COLORS : BRIDE_OUTFIT_COLORS} onChange={set('outfitColor')} />
      <Swatches label="Embroidery / jewellery" value={cfg.accent} colors={ACCENT_COLORS} onChange={set('accent')} />
      <Chips label="Headwear" value={cfg.headwear} options={groom ? GROOM_HEADWEAR : BRIDE_HEADWEAR} onChange={set('headwear')} />
      {groom && cfg.headwear === 'safa' && <Swatches label="Safa colour" value={cfg.headwearColor} colors={['#b3122e', '#f59b1a', '#d6336c', '#f3e6c8', '#0f5c46', '#1d2f6f']} onChange={set('headwearColor')} />}
      {!groom && <Swatches label="Lip colour" value={cfg.lip} colors={LIP_COLORS} onChange={set('lip')} />}
      <div className="toggles">
        <Toggle label="Glasses" value={cfg.glasses} onChange={set('glasses')} />
        {groom ? (
          <>
            <Toggle label="Moustache" value={cfg.mustache} onChange={set('mustache')} />
            <Toggle label="Pearl mala" value={cfg.mala} onChange={set('mala')} />
          </>
        ) : (
          <>
            <Toggle label="Bindi" value={cfg.bindi} onChange={set('bindi')} />
            <Toggle label="Maang tikka" value={cfg.tikka} onChange={set('tikka')} />
            <Toggle label="Nath" value={cfg.nath} onChange={set('nath')} />
            <Toggle label="Necklace" value={cfg.necklace} onChange={set('necklace')} />
          </>
        )}
      </div>
    </div>
  )
}
