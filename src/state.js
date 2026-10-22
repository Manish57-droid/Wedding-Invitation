import { defaultAvatar } from './avatar/options.js'

const KEY = 'shubh-invites:v1'

function isoInDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function initialData() {
  return {
    templateId: 'royal',
    groom: { name: 'Aarav', parents: 'Mr. & Mrs. Rajesh Sharma', avatar: defaultAvatar('groom'), photo: null },
    bride: { name: 'Diya', parents: 'Mr. & Mrs. Anil Verma', avatar: defaultAvatar('bride'), photo: null },
    blessings: 'Smt. Kamla Devi & Late Shri Ram Prasad Sharma',
    inviteLine: 'request the pleasure of your company at the wedding of',
    date: isoInDays(90),
    time: '19:30',
    venue: 'The Royal Palms',
    address: 'Lake Road, Udaipur, Rajasthan',
    events: [
      { name: 'Haldi', date: isoInDays(88), time: '10:00', venue: '' },
      { name: 'Mehendi', date: isoInDays(88), time: '16:00', venue: '' },
      { name: 'Sangeet', date: isoInDays(89), time: '19:00', venue: '' },
      { name: 'Wedding', date: isoInDays(90), time: '19:30', venue: '' },
      { name: 'Reception', date: isoInDays(91), time: '20:00', venue: '' },
    ],
    showInvocation: true,
    hashtag: '#AaravWedsDiya',
    rsvp: 'Sharma Family · +91 98765 43210',
    closing: 'Your presence and blessings will make our celebration complete',
    includePhotos: false,
    music: { mode: 'generated', style: 'auto' },
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      const base = initialData()
      return {
        ...base,
        ...saved,
        groom: { ...base.groom, ...saved.groom, avatar: { ...base.groom.avatar, ...saved.groom?.avatar } },
        bride: { ...base.bride, ...saved.bride, avatar: { ...base.bride.avatar, ...saved.bride?.avatar } },
        // uploaded music files can't be persisted
        music: saved.music?.mode === 'upload' ? base.music : { ...base.music, ...saved.music },
      }
    }
  } catch {
    // storage unavailable or corrupt: start fresh
  }
  return initialData()
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // quota exceeded / private mode: retry without photos
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...data, groom: { ...data.groom, photo: null }, bride: { ...data.bride, photo: null } }))
    } catch {
      // give up silently; persistence is a convenience
    }
  }
}

export function clearData() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
