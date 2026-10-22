// Copies the MediaPipe wasm runtime into public/ so the app is fully self-hosted.
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm')
const dest = join(root, 'public', 'mediapipe')

if (existsSync(src)) {
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
  console.log('Copied MediaPipe wasm to public/mediapipe')
} else {
  console.warn('MediaPipe wasm not found; face analysis will be unavailable')
}
