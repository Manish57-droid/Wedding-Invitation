export function hexToRgb(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function rgbToHex([r, g, b]) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** Lighten (amt > 0) or darken (amt < 0) a hex colour; amt in [-1, 1]. */
export function shade(hex, amt) {
  const rgb = hexToRgb(hex)
  const target = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  return rgbToHex(rgb.map((v) => v + (target - v) * p))
}

export function mix(a, b, t) {
  const ra = hexToRgb(a)
  const rb = hexToRgb(b)
  return rgbToHex(ra.map((v, i) => v + (rb[i] - v) * t))
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

export function colorDistance(a, b) {
  const ra = hexToRgb(a)
  const rb = hexToRgb(b)
  return Math.hypot(ra[0] - rb[0], ra[1] - rb[1], ra[2] - rb[2])
}
