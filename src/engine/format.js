export function parseDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function formatTime(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function dateParts(iso) {
  const d = parseDate(iso)
  if (!d) return null
  return {
    weekday: d.toLocaleDateString('en-IN', { weekday: 'long' }),
    day: d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'long' }),
    year: d.getFullYear(),
    short: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  }
}

export function shortDate(iso) {
  const d = parseDate(iso)
  return d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : ''
}

const EVENT_ICONS = [
  [/haldi|pithi|ubtan/i, '🌼'],
  [/mehe?n?di|henna/i, '🌿'],
  [/sangeet|music|dance|garba/i, '🎶'],
  [/engage|ring|sagai|roka/i, '💍'],
  [/recep/i, '🥂'],
  [/cocktail|party/i, '🍸'],
  [/puja|pooja|path|havan/i, '🪔'],
  [/baraat|barat/i, '🐎'],
  [/wedding|shaadi|vivah|phera|lagna|nikah|marriage|muhurat/i, '💞'],
  [/lunch|dinner|feast|bhoj/i, '🍽️'],
]

export function eventIcon(name) {
  for (const [re, icon] of EVENT_ICONS) if (re.test(name || '')) return icon
  return '✨'
}

export function initials(a, b) {
  const i = (s) => (s || '').trim().charAt(0).toUpperCase()
  return `${i(a)}${i(b)}`
}
