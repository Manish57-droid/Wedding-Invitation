import royal from './royal.js'
import marigold from './marigold.js'
import doodle from './doodle.js'
import filmy from './filmy.js'
import palace from './palace.js'
import minimal from './minimal.js'

export const TEMPLATES = [royal, marigold, doodle, filmy, palace, minimal]

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0]
}
