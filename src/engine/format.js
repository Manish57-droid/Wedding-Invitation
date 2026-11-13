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

// [pattern, main icon, decorative emojis floating around it, glow colour]
const EVENT_STYLES = [
  [/haldi|pithi|ubtan/i, '🌼', ['🌼', '💛', '🌻', '✨'], '#ffc107'],
  [/mehe?n?di|henna/i, '🌿', ['🌿', '✋', '🍃', '💚'], '#3fae5a'],
  [/sangeet|music|dance|garba/i, '🎶', ['🎶', '💃', '🕺', '🎤'], '#9b5de5'],
  [/engage|ring|sagai|roka/i, '💍', ['💍', '💖', '✨', '🥂'], '#ff6b9a'],
  [/recep/i, '🥂', ['🥂', '✨', '🎉', '🍰'], '#e0b04a'],
  [/cocktail|party/i, '🍸', ['🍸', '🎉', '🪩', '✨'], '#00bcd4'],
  [/puja|pooja|path|havan/i, '🪔', ['🪔', '🌺', '🙏', '✨'], '#ff8c1a'],
  [/baraat|barat/i, '🐎', ['🐎', '🥁', '🎺', '🎉'], '#e8364f'],
  [/tilak|tika/i, '🔴', ['🌺', '🙏', '✨', '🪔'], '#e8364f'],
  [/wedding|shaadi|vivah|phera|lagna|nikah|marriage|muhurat/i, '💞', ['🔥', '💍', '🌺', '💞'], '#e63950'],
  [/lunch|dinner|feast|bhoj/i, '🍽️', ['🍛', '🍰', '🍽️', '✨'], '#f4a261'],
]

export function eventStyle(name) {
  for (const [re, icon, emojis, color] of EVENT_STYLES) if (re.test(name || '')) return { icon, emojis, color }
  return { icon: '✨', emojis: ['✨', '🎉', '💖', '🌸'], color: '#ff8fb1' }
}

export function eventIcon(name) {
  return eventStyle(name).icon
}

export const MAX_EVENTS = 8

/** Functions that appear in the video (named ones only, capped). */
export function activeEvents(data) {
  return (data.events || []).filter((e) => e.name?.trim()).slice(0, MAX_EVENTS)
}

export function longDate(iso) {
  const d = parseDate(iso)
  return d ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
}

export function initials(a, b) {
  const i = (s) => (s || '').trim().charAt(0).toUpperCase()
  return `${i(a)}${i(b)}`
}
