import royal from './royal.js'
import marigold from './marigold.js'
import doodle from './doodle.js'
import filmy from './filmy.js'
import palace from './palace.js'
import minimal from './minimal.js'
import groovy from './groovy.js'
import disco from './disco.js'
import neon from './neon.js'
import chat from './chat.js'
import story from './story.js'
import bubblegum from './bubblegum.js'
import comic from './comic.js'
import arcade from './arcade.js'
import y2k from './y2k.js'
import news from './news.js'
import caution from './caution.js'
import boarding from './boarding.js'
import cricket from './cricket.js'

const CLASSIC = { royal: 'Traditional', marigold: 'Traditional', palace: 'Traditional', minimal: 'Traditional', doodle: 'Fun', filmy: 'Fun' }

export const TEMPLATES = [
  royal, marigold, doodle, filmy, palace, minimal,
  chat, story, bubblegum,
  groovy, disco, neon,
  comic, news, caution, arcade, y2k, boarding, cricket,
].map((t) => ({ ...t, category: t.category || CLASSIC[t.id] || 'Fun' }))

export const CATEGORIES = [
  ['all', 'All'],
  ['Traditional', '🪔 Traditional'],
  ['Funny', '😂 Funny'],
  ['Gen-Z', '✨ Gen-Z'],
  ['Groovy', '🕺 Groovy'],
  ['Fun', '🎬 Playful'],
]

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0]
}
