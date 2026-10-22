import { colorDistance, luminance, rgbToHex, shade, mix } from '../lib/color.js'
import { HAIR_COLORS } from './options.js'

const BASE = import.meta.env.BASE_URL

let landmarkerPromise = null

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const fileset = await FilesetResolver.forVisionTasks(`${BASE}mediapipe`)
      const opts = (delegate) => ({
        baseOptions: { modelAssetPath: `${BASE}models/face_landmarker.task`, delegate },
        runningMode: 'IMAGE',
        numFaces: 1,
      })
      try {
        return await FaceLandmarker.createFromOptions(fileset, opts('GPU'))
      } catch {
        return await FaceLandmarker.createFromOptions(fileset, opts('CPU'))
      }
    })()
    landmarkerPromise.catch(() => (landmarkerPromise = null))
  }
  return landmarkerPromise
}

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read that image'))
    img.src = url
  })
}

/** Draw the image downscaled onto a canvas so pixel sampling is cheap. */
function toCanvas(img, maxSide = 900) {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * scale)
  c.height = Math.round(img.naturalHeight * scale)
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, c.width, c.height)
  return { canvas: c, ctx }
}

function samplePatch(ctx, x, y, r) {
  const { width, height } = ctx.canvas
  const x0 = Math.max(0, Math.round(x - r))
  const y0 = Math.max(0, Math.round(y - r))
  const w = Math.min(width - x0, Math.round(r * 2))
  const h = Math.min(height - y0, Math.round(r * 2))
  if (w <= 0 || h <= 0) return []
  const data = ctx.getImageData(x0, y0, w, h).data
  const out = []
  for (let i = 0; i < data.length; i += 4) out.push([data[i], data[i + 1], data[i + 2]])
  return out
}

/** Per-channel median, robust to specular highlights and stray pixels. */
function median(pixels) {
  if (!pixels.length) return null
  const ch = [0, 1, 2].map((k) => pixels.map((p) => p[k]).sort((a, b) => a - b)[Math.floor(pixels.length / 2)])
  return rgbToHex(ch)
}

/** Photos are often too dark or washed out; pull the tone into a natural cartoon range. */
function normalizeSkin(hex) {
  const l = luminance(hex)
  if (l < 70) return shade(hex, 0.25)
  if (l > 225) return shade(hex, -0.12)
  return mix(hex, '#d39a74', 0.15)
}

function nearestHair(hex) {
  let best = HAIR_COLORS[0]
  let bestD = Infinity
  for (const c of HAIR_COLORS) {
    const d = colorDistance(c, hex)
    if (d < bestD) {
      bestD = d
      best = c
    }
  }
  return best
}

/**
 * Analyse a portrait and return avatar overrides plus a square face crop.
 * Everything runs locally in the browser; the photo never leaves the device.
 */
export async function analyzeFace(img, role) {
  const { canvas, ctx } = toCanvas(img)
  const W = canvas.width
  const H = canvas.height
  let lm = null
  try {
    const landmarker = await getLandmarker()
    const res = landmarker.detect(canvas)
    lm = res.faceLandmarks?.[0] || null
  } catch (err) {
    console.warn('Face landmarker unavailable', err)
  }

  if (!lm) {
    const skin = median(samplePatch(ctx, W / 2, H * 0.42, Math.min(W, H) * 0.06))
    return {
      found: false,
      overrides: skin ? { skin: normalizeSkin(skin) } : {},
      crop: cropSquare(canvas, W / 2, H * 0.4, Math.min(W, H) * 0.45),
    }
  }

  const P = (i) => ({ x: lm[i].x * W, y: lm[i].y * H })
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
  const top = P(10)
  const chin = P(152)
  const left = P(234)
  const right = P(454)
  const faceH = dist(top, chin)
  const faceW = dist(left, right)
  const r = Math.max(3, faceW * 0.05)

  // skin: cheeks and lower forehead
  const skinPx = [...samplePatch(ctx, P(50).x, P(50).y, r), ...samplePatch(ctx, P(280).x, P(280).y, r), ...samplePatch(ctx, P(151).x, P(151).y, r)]
  const rawSkin = median(skinPx) || '#c98e66'
  const skin = normalizeSkin(rawSkin)
  const skinLum = luminance(rawSkin)

  // hair: just above the forehead, along the head's vertical axis
  // walk upwards row by row and take the first row that no longer looks like skin
  const up = { x: (top.x - chin.x) / faceH, y: (top.y - chin.y) / faceH }
  let rawHair = null
  for (const k of [0.06, 0.12, 0.18, 0.25, 0.32]) {
    const row = []
    for (const lateral of [-0.18, 0, 0.18]) {
      row.push(...samplePatch(ctx, top.x + up.x * faceH * k - up.y * faceW * lateral, top.y + up.y * faceH * k + up.x * faceW * lateral, r * 0.8))
    }
    const c = median(row)
    if (c && colorDistance(c, rawSkin) > 45) {
      rawHair = c
      break
    }
  }
  const hair = rawHair ? nearestHair(rawHair) : HAIR_COLORS[1]
  const thinHair = !rawHair

  // face shape from landmark proportions
  const jawW = dist(P(172), P(397))
  const foreheadW = dist(P(54), P(284))
  const ratio = faceH / faceW
  let faceShape = 'oval'
  if (jawW / faceW > 0.86 && ratio < 1.32) faceShape = 'square'
  else if (foreheadW / jawW > 1.12 && ratio > 1.15) faceShape = 'heart'
  else if (ratio < 1.18) faceShape = 'round'

  const overrides = { skin, hair, faceShape }

  if (role === 'groom') {
    const chinPx = samplePatch(ctx, (P(152).x + P(17).x) / 2, (P(152).y + P(17).y) / 2, r)
    const jawPx = [...samplePatch(ctx, P(172).x * 0.8 + P(152).x * 0.2, P(172).y, r * 0.8), ...samplePatch(ctx, P(397).x * 0.8 + P(152).x * 0.2, P(397).y, r * 0.8)]
    const lipPx = samplePatch(ctx, (P(2).x + P(0).x) / 2, (P(2).y + P(0).y) / 2, r * 0.6)
    const chinLum = luminance(median(chinPx) || rawSkin)
    const jawLum = luminance(median(jawPx) || rawSkin)
    const lipLum = luminance(median(lipPx) || rawSkin)
    const beardRatio = Math.min(chinLum, jawLum) / skinLum
    overrides.beard = beardRatio < 0.62 ? 'full' : beardRatio < 0.75 ? 'short' : beardRatio < 0.87 ? 'stubble' : 'none'
    overrides.mustache = lipLum / skinLum < 0.72
    if (thinHair) overrides.hairStyle = 'buzz'
  }

  const cx = (left.x + right.x) / 2
  const cy = (top.y + chin.y) / 2 - faceH * 0.08
  return { found: true, overrides, crop: cropSquare(canvas, cx, cy, faceH * 0.95) }
}

function cropSquare(canvas, cx, cy, half) {
  const size = 512
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(canvas, cx - half, cy - half, half * 2, half * 2, 0, 0, size, size)
  return c.toDataURL('image/jpeg', 0.85)
}
