import royal from './royal.js'
import marigold from './marigold.js'
import palace from './palace.js'
import minimal from './minimal.js'

export const TEMPLATES = [royal, marigold, palace, minimal]

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0]
}
