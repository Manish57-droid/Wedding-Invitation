import { buildAvatarSvg } from '../avatar/buildAvatarSvg.js'

const FONT_SPECS = [
  '400 40px "Cinzel"',
  '700 40px "Cinzel"',
  '400 40px "Great Vibes"',
  '400 40px "Cormorant Garamond"',
  '600 40px "Cormorant Garamond"',
  'italic 400 40px "Cormorant Garamond"',
  'italic 600 40px "Cormorant Garamond"',
  '400 40px "Yatra One"',
  '400 40px "Playfair Display"',
  '600 40px "Playfair Display"',
  '700 40px "Playfair Display"',
  '400 40px "Caveat"',
  '700 40px "Caveat"',
  '400 40px "Patrick Hand"',
  '400 40px "Bebas Neue"',
]

let fontsReady = null
/** Canvas text only uses webfonts once they are loaded, so load them before the first frame. */
export function ensureFonts() {
  if (!fontsReady) {
    fontsReady = Promise.all(FONT_SPECS.map((f) => document.fonts.load(f, 'Aa शुभ').catch(() => null))).then(() => document.fonts.ready)
  }
  return fontsReady
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image failed to load'))
    img.src = src
  })
}

/** Rasterise an SVG string at `scale`x so it stays crisp when drawn large in the video. */
export async function svgToBitmap(svg, scale = 2) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const img = await loadImage(url)
    const c = document.createElement('canvas')
    c.width = 400 * scale
    c.height = 600 * scale
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    return c
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function loadAssets(data) {
  await ensureFonts()
  const avatars = {}
  const photos = {}
  for (const who of ['groom', 'bride']) {
    const cfg = data[who].avatar
    const [open, blink] = await Promise.all([svgToBitmap(buildAvatarSvg(cfg)), svgToBitmap(buildAvatarSvg(cfg, { blink: true }))])
    avatars[who] = { open, blink }
    if (data[who].photo) photos[who] = await loadImage(data[who].photo).catch(() => null)
  }
  return { avatars, photos }
}
