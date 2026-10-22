export const SKIN_TONES = ['#f6d7c3', '#eec1a0', '#e0ac85', '#cf9671', '#b67b55', '#95603f', '#73472d', '#4f301f']
export const HAIR_COLORS = ['#0f0b0a', '#2a1b14', '#3d2617', '#5a3a22', '#7b5233', '#a0703f', '#8a8a8a', '#d9d4cc']
export const GROOM_OUTFIT_COLORS = ['#f3e6c8', '#d9b56a', '#7a1430', '#1d2f6f', '#0f5c46', '#f2b8a0', '#1b1b1f', '#e8e8ea']
export const BRIDE_OUTFIT_COLORS = ['#b3122e', '#6d0f2c', '#d6336c', '#f2a07b', '#d9b56a', '#0f5c46', '#5b2a86', '#f5efe4']
export const ACCENT_COLORS = ['#d4a64a', '#f0d48a', '#c0c0c8', '#b3122e', '#0f5c46', '#f5efe4']
export const LIP_COLORS = ['#b3263a', '#8c1d2f', '#c95a6a', '#a8554b', '#d4707a']

export const FACE_SHAPES = [
  { id: 'oval', label: 'Oval' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'heart', label: 'Heart' },
]

export const GROOM_HAIR = [
  { id: 'short', label: 'Short' },
  { id: 'side', label: 'Side swept' },
  { id: 'curly', label: 'Curly' },
  { id: 'buzz', label: 'Buzz cut' },
]
export const BRIDE_HAIR = [
  { id: 'bun', label: 'Bridal bun' },
  { id: 'braid', label: 'Braid' },
  { id: 'open', label: 'Open hair' },
]
export const BEARDS = [
  { id: 'none', label: 'Clean' },
  { id: 'stubble', label: 'Stubble' },
  { id: 'short', label: 'Short beard' },
  { id: 'full', label: 'Full beard' },
]
export const GROOM_OUTFITS = [
  { id: 'sherwani', label: 'Sherwani' },
  { id: 'kurta', label: 'Kurta' },
  { id: 'suit', label: 'Suit' },
]
export const BRIDE_OUTFITS = [
  { id: 'lehenga', label: 'Lehenga' },
  { id: 'saree', label: 'Saree' },
  { id: 'gown', label: 'Gown' },
]
export const GROOM_HEADWEAR = [
  { id: 'none', label: 'None' },
  { id: 'safa', label: 'Safa (turban)' },
]
export const BRIDE_HEADWEAR = [
  { id: 'veil', label: 'Dupatta veil' },
  { id: 'none', label: 'None' },
]

export function defaultAvatar(role) {
  if (role === 'groom') {
    return {
      role,
      skin: SKIN_TONES[3],
      hair: HAIR_COLORS[1],
      faceShape: 'oval',
      hairStyle: 'short',
      beard: 'none',
      mustache: false,
      glasses: false,
      outfit: 'sherwani',
      outfitColor: GROOM_OUTFIT_COLORS[0],
      accent: ACCENT_COLORS[0],
      headwear: 'safa',
      headwearColor: '#b3122e',
      mala: true,
    }
  }
  return {
    role,
    skin: SKIN_TONES[2],
    hair: HAIR_COLORS[1],
    faceShape: 'oval',
    hairStyle: 'bun',
    glasses: false,
    outfit: 'lehenga',
    outfitColor: BRIDE_OUTFIT_COLORS[0],
    accent: ACCENT_COLORS[0],
    headwear: 'veil',
    lip: LIP_COLORS[0],
    bindi: true,
    tikka: true,
    nath: true,
    necklace: true,
  }
}
