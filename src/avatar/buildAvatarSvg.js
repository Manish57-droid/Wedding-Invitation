import { shade } from '../lib/color.js'

// Avatars are drawn on a 400x600 canvas: big head (bitmoji proportions) over a bust.
export const AVATAR_W = 400
export const AVATAR_H = 600

const CX = 200
const EYE_Y = 205
const EYE_DX = 38

const FACE_GEOMETRY = {
  oval: { w: 90, jaw: 70, chin: 28, chinY: 300 },
  round: { w: 98, jaw: 90, chin: 40, chinY: 294 },
  square: { w: 94, jaw: 96, chin: 50, chinY: 298 },
  heart: { w: 96, jaw: 58, chin: 18, chinY: 302 },
}

let uid = 0

function facePath({ w, jaw, chin, chinY }) {
  return `M${CX},92 C${CX + w * 0.6},92 ${CX + w},128 ${CX + w},192
    C${CX + w},242 ${CX + jaw},${chinY - 22} ${CX + chin},${chinY - 4}
    Q${CX},${chinY + 6} ${CX - chin},${chinY - 4}
    C${CX - jaw},${chinY - 22} ${CX - w},242 ${CX - w},192
    C${CX - w},128 ${CX - w * 0.6},92 ${CX},92Z`
}

/** Points along a quadratic curve, used for bead strings (mala, garlands, necklaces). */
function beads(x0, y0, cx, cy, x1, y1, n, r, fill, stroke) {
  let s = ''
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`
  }
  return s
}

function eyes(cfg, blink) {
  const dark = '#24160f'
  const bride = cfg.role === 'bride'
  let s = ''
  for (const side of [-1, 1]) {
    const x = CX + side * EYE_DX
    if (blink) {
      s += `<path d="M${x - 17},${EYE_Y + 2} Q${x},${EYE_Y + 12} ${x + 17},${EYE_Y + 2}" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`
      if (bride) s += `<path d="M${x + side * 15},${EYE_Y + 3} l${side * 7},-2" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`
      continue
    }
    s += `<ellipse cx="${x}" cy="${EYE_Y}" rx="18" ry="14" fill="#fffdf8"/>`
    s += `<circle cx="${x + 1}" cy="${EYE_Y + 1}" r="10.5" fill="#4a2a18"/>`
    s += `<circle cx="${x + 1}" cy="${EYE_Y + 1}" r="5.5" fill="#120a06"/>`
    s += `<circle cx="${x + 5}" cy="${EYE_Y - 4}" r="3.2" fill="#fff"/>`
    // upper lid / eyeliner
    s += `<path d="M${x - 19},${EYE_Y + 1} Q${x},${EYE_Y - 20} ${x + 19},${EYE_Y + 1}" fill="none" stroke="${dark}" stroke-width="${bride ? 5 : 3.5}" stroke-linecap="round"/>`
    if (bride) {
      // winged kajal and lashes
      s += `<path d="M${x + side * 18},${EYE_Y - 1} l${side * 9},-6" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`
      s += `<path d="M${x - 16},${EYE_Y + 9} Q${x},${EYE_Y + 17} ${x + 16},${EYE_Y + 9}" fill="none" stroke="${dark}" stroke-width="1.6" opacity=".55"/>`
    }
  }
  return s
}

function brows(cfg) {
  const c = shade(cfg.hair, -0.2)
  const groom = cfg.role === 'groom'
  let s = ''
  for (const side of [-1, 1]) {
    const x = CX + side * EYE_DX
    const w = groom ? 7 : 4.5
    s += `<path d="M${x - side * 18},${EYE_Y - 26 + (groom ? 1 : 2)} Q${x},${EYE_Y - 36} ${x + side * 20},${EYE_Y - 27}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`
  }
  return s
}

function mouth(cfg) {
  if (cfg.role === 'bride') {
    const lip = cfg.lip || '#b3263a'
    return `<path d="M178,264 Q200,292 222,264 Q200,270 178,264Z" fill="${shade(lip, -0.35)}"/>
      <path d="M182,265.5 Q200,271 218,265.5 L216,269 Q200,275 184,269Z" fill="#fff"/>
      <path d="M176,263 Q188,256 200,260 Q212,256 224,263 Q200,268 176,263Z" fill="${lip}"/>
      <path d="M178,265 Q200,296 222,265 Q200,290 178,265Z" fill="${lip}"/>`
  }
  return `<path d="M178,264 Q200,292 222,264 Q200,270 178,264Z" fill="#6e2a2a"/>
    <path d="M182,265.5 Q200,271 218,265.5 L216,269 Q200,275 184,269Z" fill="#fff"/>`
}

function beard(cfg, g) {
  if (cfg.role !== 'groom') return ''
  const c = cfg.hair
  let s = ''
  const { w, jaw, chin, chinY } = g
  if (cfg.beard === 'stubble') {
    s += `<path d="M${CX - w + 4},226 C${CX - w + 2},256 ${CX - jaw},${chinY - 20} ${CX - chin},${chinY - 3}
      Q${CX},${chinY + 7} ${CX + chin},${chinY - 3} C${CX + jaw},${chinY - 20} ${CX + w - 2},256 ${CX + w - 4},226
      C${CX + w - 20},256 ${CX + 40},250 ${CX + 30},262 Q${CX},300 ${CX - 30},262 C${CX - 40},250 ${CX - w + 20},256 ${CX - w + 4},226Z"
      fill="${c}" opacity=".28"/>`
  } else if (cfg.beard === 'short' || cfg.beard === 'full') {
    const drop = cfg.beard === 'full' ? 26 : 10
    s += `<path d="M${CX - w + 1},222 C${CX - w - 1},256 ${CX - jaw - 2},${chinY - 14} ${CX - chin - 6},${chinY + drop - 8}
      Q${CX},${chinY + drop + 10} ${CX + chin + 6},${chinY + drop - 8} C${CX + jaw + 2},${chinY - 14} ${CX + w + 1},256 ${CX + w - 1},222
      L${CX + w - 12},226 C${CX + w - 18},252 ${CX + 44},248 ${CX + 30},262 Q${CX},304 ${CX - 30},262 C${CX - 44},248 ${CX - w + 18},252 ${CX - w + 12},226Z"
      fill="${c}"/>`
  }
  if (cfg.mustache || cfg.beard === 'short' || cfg.beard === 'full') {
    s += `<path d="M166,262 Q182,244 200,251 Q218,244 234,262 Q218,256 200,259 Q182,256 166,262Z" fill="${c}"/>`
  }
  return s
}

function glasses(cfg) {
  if (!cfg.glasses) return ''
  const c = '#1d1714'
  let s = ''
  for (const side of [-1, 1]) {
    const x = CX + side * EYE_DX
    s += `<rect x="${x - 30}" y="${EYE_Y - 22}" width="60" height="44" rx="16" fill="#ffffff" fill-opacity=".14" stroke="${c}" stroke-width="5"/>`
  }
  s += `<path d="M${CX - 8},${EYE_Y - 6} Q${CX},${EYE_Y - 12} ${CX + 8},${EYE_Y - 6}" fill="none" stroke="${c}" stroke-width="5"/>`
  return s
}

// ---------- hair ----------

function groomHairBack() {
  return ''
}

function groomHairFront(cfg, g) {
  const c = cfg.hair
  const hi = shade(c, 0.18)
  const w = g.w
  if (cfg.headwear === 'safa') {
    // only sideburns peek out under the turban
    return `<path d="M${CX - w - 2},170 L${CX - w + 12},168 L${CX - w + 10},214 L${CX - w + 1},212Z" fill="${c}"/>
      <path d="M${CX + w + 2},170 L${CX + w - 12},168 L${CX + w - 10},214 L${CX + w - 1},212Z" fill="${c}"/>`
  }
  switch (cfg.hairStyle) {
    case 'buzz':
      return `<path d="M${CX - w - 2},200 C${CX - w - 8},96 ${CX - 50},70 ${CX},70 C${CX + 50},70 ${CX + w + 8},96 ${CX + w + 2},200
        L${CX + w - 4},200 C${CX + w - 6},150 ${CX + w - 24},122 ${CX},120 C${CX - w + 24},122 ${CX - w + 6},150 ${CX - w + 4},200Z" fill="${c}" opacity=".85"/>`
    case 'curly': {
      let s = `<path d="M${CX - w - 6},205 C${CX - w - 18},86 ${CX - 50},50 ${CX},50 C${CX + 50},50 ${CX + w + 18},86 ${CX + w + 6},205
        L${CX + w - 2},205 C${CX + w - 6},150 ${CX + w - 24},126 ${CX},124 C${CX - w + 24},126 ${CX - w + 6},150 ${CX - w + 2},205Z" fill="${c}"/>`
      const pts = [[-1.05, 150], [-0.98, 112], [-0.8, 82], [-0.55, 62], [-0.25, 52], [0.05, 50], [0.35, 55], [0.62, 68], [0.86, 92], [1.02, 124], [1.06, 160], [-0.45, 112], [-0.1, 118], [0.25, 116], [0.6, 120], [-0.78, 128], [0.85, 136]]
      for (const [fx, y] of pts) {
        s += `<circle cx="${CX + fx * w}" cy="${y}" r="${y > 105 ? 17 : 24}" fill="${c}"/>`
        s += `<path d="M${CX + fx * w - 8},${y - 4} q8,-8 14,0" stroke="${hi}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`
      }
      return s
    }
    case 'side':
      return `<path d="M${CX - w - 6},208 C${CX - w - 20},80 ${CX - 60},36 ${CX + 10},40 C${CX + 80},38 ${CX + w + 22},86 ${CX + w + 6},208
        L${CX + w - 2},208 C${CX + w - 4},160 ${CX + w - 10},128 ${CX + 52},116 C${CX + 20},112 ${CX - 30},116 ${CX - 60},132
        C${CX - 80},142 ${CX - w + 6},160 ${CX - w + 3},208Z" fill="${c}"/>
        <path d="M${CX - 46},60 C${CX + 10},50 ${CX + 60},70 ${CX + 76},106" stroke="${hi}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>
        <path d="M${CX - 70},90 C${CX - 20},76 ${CX + 30},84 ${CX + 52},114" stroke="${hi}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".4"/>`
    case 'short':
    default:
      return `<path d="M${CX - w - 6},206 C${CX - w - 18},86 ${CX - 50},48 ${CX},48 C${CX + 50},48 ${CX + w + 18},86 ${CX + w + 6},206
        L${CX + w - 2},206 C${CX + w - 4},150 ${CX + w - 18},120 ${CX + 34},114 C${CX + 14},124 ${CX - 10},112 ${CX - 30},120
        C${CX - 60},116 ${CX - w + 4},140 ${CX - w + 2},206Z" fill="${c}"/>
        <path d="M${CX - 50},70 C${CX - 10},58 ${CX + 40},62 ${CX + 64},84" stroke="${hi}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>`
  }
}

function brideHairBack(cfg, g) {
  const c = cfg.hair
  const w = g.w
  let s = ''
  if (cfg.hairStyle === 'bun') {
    s += `<circle cx="${CX}" cy="72" r="46" fill="${c}"/>`
    // gajra (jasmine string) around the bun
    for (let i = 0; i < 14; i++) {
      const a = Math.PI + (i / 13) * Math.PI
      s += `<circle cx="${CX + Math.cos(a) * 46}" cy="${72 + Math.sin(a) * 46}" r="6" fill="#fffaf0" stroke="#e8dcc0" stroke-width="1"/>`
    }
  }
  if (cfg.hairStyle === 'open') {
    s += `<path d="M${CX - w - 10},190 C${CX - w - 20},70 ${CX + w + 20},70 ${CX + w + 10},190 C${CX + w + 22},300 ${CX + w + 30},380 ${CX + w + 10},430 L${CX - w - 10},430 C${CX - w - 30},380 ${CX - w - 22},300 ${CX - w - 10},190Z" fill="${c}"/>`
  }
  return s
}

function brideHairFront(cfg, g) {
  const c = cfg.hair
  const hi = shade(c, 0.2)
  const w = g.w
  let s = `<path d="M${CX - w - 10},236 C${CX - w - 20},92 ${CX - 44},56 ${CX},58 C${CX + 44},56 ${CX + w + 20},92 ${CX + w + 10},236
    L${CX + w - 2},236 C${CX + w - 2},160 ${CX + 44},104 ${CX},100 C${CX - 44},104 ${CX - w + 2},160 ${CX - w + 2},236Z" fill="${c}"/>
    <path d="M${CX - 10},64 C${CX - 50},70 ${CX - w + 4},104 ${CX - w - 2},170" stroke="${hi}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>
    <path d="M${CX + 10},64 C${CX + 50},70 ${CX + w - 4},104 ${CX + w + 2},170" stroke="${hi}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>
    <path d="M${CX},60 L${CX},100" stroke="${shade(c, -0.4)}" stroke-width="2"/>`
  if (cfg.hairStyle === 'open') {
    s += `<path d="M${CX - w - 10},210 C${CX - w - 18},300 ${CX - w - 20},380 ${CX - w - 40},460 C${CX - w - 10},470 ${CX - w + 6},440 ${CX - w + 8},400 C${CX - w + 10},330 ${CX - w + 4},280 ${CX - w + 2},236Z" fill="${c}"/>
      <path d="M${CX + w + 10},210 C${CX + w + 18},300 ${CX + w + 20},380 ${CX + w + 40},460 C${CX + w + 10},470 ${CX + w - 6},440 ${CX + w - 8},400 C${CX + w - 10},330 ${CX + w - 4},280 ${CX + w - 2},236Z" fill="${c}"/>`
  }
  if (cfg.hairStyle === 'braid') {
    for (let i = 0; i < 9; i++) {
      const y = 250 + i * 30
      const x = CX + w - 4 + Math.sin(i * 0.5) * 6 + i * 2
      s += `<ellipse cx="${x}" cy="${y}" rx="${19 - i * 0.8}" ry="20" fill="${c}" stroke="${shade(c, -0.35)}" stroke-width="2"/>`
      s += `<path d="M${x - 10},${y - 6} q10,8 18,-2" stroke="${hi}" stroke-width="2.5" fill="none" opacity=".5"/>`
    }
    s += `<path d="M${CX + w + 18},515 l-8,26 l16,0 Z" fill="${cfg.accent}"/>`
  }
  return s
}

// ---------- outfits ----------

function torso(narrow = 0) {
  return `M${120 + narrow},352 C${80 + narrow},362 ${52 + narrow},392 ${46 + narrow},440 L${40 + narrow},600 L${360 - narrow},600 L${354 - narrow},440 C${348 - narrow},392 ${320 - narrow},362 ${280 - narrow},352 Q240,342 200,345 Q160,342 ${120 + narrow},352Z`
}

function groomOutfit(cfg) {
  const o = cfg.outfitColor
  const a = cfg.accent
  const sh = shade(o, -0.18)
  let s = ''
  if (cfg.outfit === 'suit') {
    s += `<path d="${torso()}" fill="${o}"/>`
    s += `<path d="M168,342 L200,440 L232,342Z" fill="#fbfbfb"/>`
    s += `<path d="M168,342 L150,360 L176,420 L160,440 L200,520 L200,440Z" fill="${sh}"/>`
    s += `<path d="M232,342 L250,360 L224,420 L240,440 L200,520 L200,440Z" fill="${sh}"/>`
    s += `<path d="M190,352 L200,346 L210,352 L206,362 L194,362Z" fill="${a}"/>`
    s += `<path d="M194,362 L188,420 L200,436 L212,420 L206,362Z" fill="${a}"/>`
    s += `<path d="M262,452 l26,-4 l2,10 l-26,4Z" fill="#fbfbfb"/>`
    s += `<circle cx="200" cy="540" r="5" fill="${shade(o, -0.4)}"/>`
    return s
  }
  s += `<path d="${torso()}" fill="${o}"/>`
  // shading on the sides
  s += `<path d="M46,440 C52,392 80,362 120,352 C96,380 86,420 84,600 L40,600Z" fill="${sh}" opacity=".6"/>`
  s += `<path d="M354,440 C348,392 320,362 280,352 C304,380 314,420 316,600 L360,600Z" fill="${sh}" opacity=".6"/>`
  if (cfg.outfit === 'kurta') {
    s += `<path d="M180,346 Q200,356 220,346 L214,358 Q200,364 186,358Z" fill="${sh}"/>`
    s += `<path d="M200,358 L200,450" stroke="${a}" stroke-width="4"/>`
    for (const y of [376, 402, 428]) s += `<circle cx="200" cy="${y}" r="4.5" fill="${a}"/>`
    s += `<path d="M150,370 q-6,40 -2,90" stroke="${sh}" stroke-width="3" fill="none" opacity=".5"/>`
  } else {
    // sherwani: bandhgala collar, placket, buttons, embroidery and a stole
    s += `<path d="M170,330 L170,354 Q200,364 230,354 L230,330 Q200,342 170,330Z" fill="${sh}" stroke="${a}" stroke-width="3"/>`
    s += `<path d="M200,360 L200,600" stroke="${a}" stroke-width="4"/>`
    for (const y of [384, 420, 456, 492, 528, 564]) s += `<circle cx="200" cy="${y}" r="5.5" fill="${a}" stroke="${shade(a, -0.3)}" stroke-width="1.5"/>`
    s += `<path d="M120,354 C140,380 150,410 160,450" stroke="${a}" stroke-width="3" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/>`
    s += `<path d="M280,354 C260,380 250,410 240,450" stroke="${a}" stroke-width="3" fill="none" stroke-dasharray="2 7" stroke-linecap="round"/>`
    for (const [x, y] of [[150, 500], [250, 500], [128, 560], [272, 560]]) {
      s += `<path d="M${x},${y} c-10,-12 6,-24 10,-10 c3,10 -6,16 -10,10Z" fill="${a}" opacity=".85"/>`
    }
    const stole = cfg.headwear === 'safa' ? cfg.headwearColor : shade(a, 0.2)
    s += `<path d="M62,410 C80,368 110,352 140,350 C150,420 140,520 130,600 L72,600 C78,540 70,470 62,410Z" fill="${stole}"/>`
    s += `<path d="M140,350 C150,420 140,520 130,600" stroke="${a}" stroke-width="5" fill="none"/>`
    s += `<path d="M62,410 C70,470 78,540 72,600" stroke="${a}" stroke-width="3" fill="none" stroke-dasharray="4 5"/>`
  }
  if (cfg.mala) {
    s += beads(166, 346, 200, 520, 234, 346, 22, 5, '#fff8e8', '#d8c9a6')
    s += beads(158, 350, 200, 590, 242, 350, 26, 5, '#fff8e8', '#d8c9a6')
    s += `<path d="M192,470 l8,-10 l8,10 l-8,12Z" fill="#c21d3a" stroke="${a}" stroke-width="2"/>`
  }
  return s
}

function brideOutfit(cfg) {
  const o = cfg.outfitColor
  const a = cfg.accent
  const sh = shade(o, -0.2)
  const S = cfg.skin
  let s = ''
  if (cfg.outfit === 'gown') {
    s += `<path d="${torso(8)}" fill="${S}"/>`
    s += `<path d="M60,450 Q130,412 200,446 Q270,412 340,450 L352,600 L48,600Z" fill="${o}"/>`
    s += `<path d="M60,450 Q130,412 200,446 Q270,412 340,450" stroke="${a}" stroke-width="4" fill="none"/>`
    for (let i = 0; i < 9; i++) s += `<circle cx="${92 + i * 27}" cy="${500 + (i % 2) * 18}" r="3" fill="${a}" opacity=".8"/>`
  } else {
    s += `<path d="${torso(8)}" fill="${o}"/>`
    s += `<path d="M54,440 C60,392 86,364 128,354 C104,380 94,420 92,600 L48,600Z" fill="${sh}" opacity=".6"/>`
    s += `<path d="M346,440 C340,392 314,364 272,354 C296,380 306,420 308,600 L352,600Z" fill="${sh}" opacity=".6"/>`
    // neckline
    s += `<path d="M150,346 Q200,440 250,346Z" fill="${S}"/>`
    s += `<path d="M150,346 Q200,440 250,346" stroke="${a}" stroke-width="7" fill="none"/>`
    s += `<path d="M150,346 Q200,440 250,346" stroke="${shade(a, -0.3)}" stroke-width="2" fill="none" stroke-dasharray="1 6" stroke-linecap="round"/>`
    // embroidered motifs (zari)
    for (const [x, y] of [[110, 470], [290, 470], [140, 540], [260, 540], [200, 560]]) {
      s += `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${a}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="3" fill="${a}"/>`
    }
    if (cfg.outfit === 'saree') {
      s += `<path d="M236,352 C280,350 330,366 348,420 L356,600 L150,600 C190,520 220,440 236,352Z" fill="${shade(o, 0.08)}"/>`
      s += `<path d="M236,352 C220,440 190,520 150,600" stroke="${a}" stroke-width="12" fill="none"/>`
      for (let i = 0; i < 4; i++) s += `<path d="M${250 + i * 22},380 C${240 + i * 22},460 ${220 + i * 24},540 ${210 + i * 26},600" stroke="${sh}" stroke-width="2" fill="none" opacity=".5"/>`
    } else {
      // lehenga dupatta over one shoulder
      s += `<path d="M262,350 C300,352 336,372 350,424 L358,600 L290,600 C298,520 284,420 262,350Z" fill="${shade(o, 0.12)}" opacity=".95"/>`
      s += `<path d="M262,350 C284,420 298,520 290,600" stroke="${a}" stroke-width="8" fill="none"/>`
    }
  }
  if (cfg.necklace !== false) {
    // choker + rani haar
    s += `<path d="M172,328 Q200,352 228,328" stroke="${a}" stroke-width="10" fill="none" stroke-linecap="round"/>`
    for (const x of [180, 190, 200, 210, 220]) {
      const y = 336 + (x === 200 ? 6 : x === 190 || x === 210 ? 4 : 1)
      s += `<circle cx="${x}" cy="${y}" r="3.5" fill="${x === 200 ? '#c21d3a' : '#1f8a5b'}"/>`
    }
    s += beads(164, 342, 200, 440, 236, 342, 18, 3.6, a, shade(a, -0.3))
    s += `<path d="M200,384 l-12,10 l12,22 l12,-22Z" fill="${a}" stroke="${shade(a, -0.3)}" stroke-width="1.5"/><circle cx="200" cy="398" r="5" fill="#c21d3a"/>`
  }
  return s
}

function veilBack(cfg) {
  if (cfg.role !== 'bride' || cfg.headwear !== 'veil') return ''
  const o = cfg.outfitColor
  return `<path d="M200,26 C110,26 64,110 60,220 C56,320 40,420 28,600 L372,600 C360,420 344,320 340,220 C336,110 290,26 200,26Z" fill="${shade(o, 0.1)}" opacity=".92"/>`
}

function veilFront(cfg) {
  if (cfg.role !== 'bride' || cfg.headwear !== 'veil') return ''
  const o = cfg.outfitColor
  const a = cfg.accent
  return `<path d="M60,240 C56,120 112,30 200,30 C288,30 344,120 340,240 L322,250 C320,150 280,72 200,72 C120,72 80,150 78,250Z" fill="${shade(o, 0.1)}"/>
    <path d="M78,250 C80,150 120,72 200,72 C280,72 320,150 322,250" stroke="${a}" stroke-width="8" fill="none"/>
    <path d="M78,250 C80,150 120,72 200,72 C280,72 320,150 322,250" stroke="${shade(a, -0.3)}" stroke-width="2.5" fill="none" stroke-dasharray="1 9" stroke-linecap="round"/>`
}

function safa(cfg) {
  if (cfg.role !== 'groom' || cfg.headwear !== 'safa') return ''
  const c = cfg.headwearColor || '#b3122e'
  const sh = shade(c, -0.22)
  const hl = shade(c, 0.22)
  const a = cfg.accent
  return `<path d="M314,150 C350,170 360,240 340,300 C332,250 318,210 300,190Z" fill="${sh}"/>
    <path d="M90,176 C70,80 140,20 200,22 C260,20 330,80 310,176 C280,150 240,136 200,136 C160,136 120,150 90,176Z" fill="${c}"/>
    <path d="M96,150 C140,110 260,100 304,150" stroke="${sh}" stroke-width="10" fill="none" opacity=".7"/>
    <path d="M100,112 C150,80 250,74 300,112" stroke="${hl}" stroke-width="9" fill="none" opacity=".6"/>
    <path d="M120,72 C160,50 240,46 280,72" stroke="${sh}" stroke-width="8" fill="none" opacity=".6"/>
    <path d="M90,176 C120,150 160,136 200,136 C240,136 280,150 310,176" stroke="${a}" stroke-width="6" fill="none"/>
    <path d="M200,136 C240,120 260,80 236,54" stroke="${a}" stroke-width="4" fill="none" stroke-dasharray="1 7" stroke-linecap="round"/>
    <path d="M218,104 C222,60 250,26 280,8 C262,40 250,74 232,108Z" fill="#fff6e0" stroke="${a}" stroke-width="2"/>
    <circle cx="214" cy="112" r="15" fill="${a}" stroke="${shade(a, -0.3)}" stroke-width="2"/>
    <circle cx="214" cy="112" r="7" fill="#1f8a5b"/>
    ${beads(196, 128, 214, 150, 232, 128, 6, 3, '#fff8e8', '#d8c9a6')}`
}

function brideJewelry(cfg, g) {
  if (cfg.role !== 'bride') return ''
  const a = cfg.accent
  let s = ''
  // jhumka earrings
  for (const side of [-1, 1]) {
    const x = CX + side * (g.w + 2)
    s += `<circle cx="${x}" cy="236" r="5" fill="${a}"/>
      <path d="M${x - 11},256 Q${x},234 ${x + 11},256Z" fill="${a}" stroke="${shade(a, -0.3)}" stroke-width="1.5"/>
      ${beads(x - 10, 259, x, 266, x + 10, 259, 4, 2.4, '#fff8e8', '#d8c9a6')}`
  }
  if (cfg.tikka) {
    s += `<path d="M200,64 L200,122" stroke="${a}" stroke-width="3"/>
      <path d="M200,118 l-10,10 l10,16 l10,-16Z" fill="${a}" stroke="${shade(a, -0.3)}" stroke-width="1.5"/>
      <circle cx="200" cy="129" r="4" fill="#c21d3a"/>`
  }
  if (cfg.bindi) s += `<circle cx="200" cy="170" r="5" fill="#c21d3a"/>`
  if (cfg.nath) {
    s += `<circle cx="216" cy="246" r="15" fill="none" stroke="${a}" stroke-width="3"/>
      <circle cx="224" cy="259" r="3" fill="#c21d3a"/>
      <path d="M230,244 C258,232 274,226 ${CX + g.w - 2},214" stroke="${a}" stroke-width="1.6" fill="none"/>`
  }
  return s
}

/**
 * Build a cartoon avatar SVG string from an avatar config.
 * @param {object} cfg avatar config (see options.defaultAvatar)
 * @param {{blink?: boolean}} opts
 */
export function buildAvatarSvg(cfg, { blink = false } = {}) {
  const id = `a${++uid}`
  const g = FACE_GEOMETRY[cfg.faceShape] || FACE_GEOMETRY.oval
  const S = cfg.skin
  const skinShade = shade(S, -0.16)
  const bride = cfg.role === 'bride'

  const parts = [
    `<defs><radialGradient id="${id}f" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="${shade(S, 0.07)}"/><stop offset=".75" stop-color="${S}"/><stop offset="1" stop-color="${skinShade}"/></radialGradient></defs>`,
    veilBack(cfg),
    bride ? brideHairBack(cfg, g) : groomHairBack(cfg, g),
    // neck
    `<path d="M${bride ? 178 : 174},268 L${bride ? 178 : 174},336 Q200,352 ${bride ? 222 : 226},336 L${bride ? 222 : 226},268Z" fill="${skinShade}"/>`,
    bride ? brideOutfit(cfg) : groomOutfit(cfg),
    // ears
    `<ellipse cx="${CX - g.w + 2}" cy="212" rx="15" ry="23" fill="${S}"/><ellipse cx="${CX - g.w + 4}" cy="213" rx="7" ry="13" fill="${skinShade}"/>`,
    `<ellipse cx="${CX + g.w - 2}" cy="212" rx="15" ry="23" fill="${S}"/><ellipse cx="${CX + g.w - 4}" cy="213" rx="7" ry="13" fill="${skinShade}"/>`,
    `<path d="${facePath(g)}" fill="url(#${id}f)"/>`,
    `<ellipse cx="${CX - 54}" cy="246" rx="17" ry="10" fill="#ff6f6f" opacity="${bride ? 0.28 : 0.14}"/>`,
    `<ellipse cx="${CX + 54}" cy="246" rx="17" ry="10" fill="#ff6f6f" opacity="${bride ? 0.28 : 0.14}"/>`,
    eyes(cfg, blink),
    brows(cfg),
    `<path d="M197,214 Q190,238 197,244 Q204,248 211,241" fill="none" stroke="${shade(S, -0.3)}" stroke-width="3.2" stroke-linecap="round"/>`,
    mouth(cfg),
    beard(cfg, g),
    bride ? brideHairFront(cfg, g) : groomHairFront(cfg, g),
    veilFront(cfg),
    safa(cfg),
    brideJewelry(cfg, g),
    glasses(cfg),
  ]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${AVATAR_W} ${AVATAR_H}" width="${AVATAR_W}" height="${AVATAR_H}">${parts.join('')}</svg>`
}
