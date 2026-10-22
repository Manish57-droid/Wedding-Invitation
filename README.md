# Shubh Invites

Animated wedding video invitations, made entirely in the browser.

1. **Template**: pick Royal Mandap, Marigold Mehendi, Palace Night or Modern Minimal.
2. **Couple**: upload a photo of each partner. MediaPipe face landmarks estimate skin tone, hair colour, face shape and beard, and turn them into a bitmoji-style avatar that you can fine-tune.
3. **Details**: date, venue, families, events (Haldi, Mehendi, Sangeet…), hashtag, RSVP.
4. **Preview & Download**: live preview with generated music, then export a 1080×1920 MP4.

All of it is free and runs client-side: no server, no API keys, and photos never leave the device.

## Run

```bash
npm install     # also copies the MediaPipe wasm into public/mediapipe
npm run dev
npm run build   # static site in dist/ (deploy to GitHub Pages / Netlify / Vercel)
```

## How it works

| Part | Where | Tech |
| --- | --- | --- |
| Face analysis | `src/avatar/analyzeFace.js` | `@mediapipe/tasks-vision` FaceLandmarker (model in `public/models`) |
| Avatars | `src/avatar/buildAvatarSvg.js` | Hand-built SVG parts (outfits, hair, jewellery, safa) |
| Animation | `src/engine/` | Canvas 2D; every frame is a pure function of time |
| Templates | `src/engine/templates/*.js` | Theme = palette, fonts, background, decor, transitions |
| Music | `src/audio/music.js` | Procedural Web Audio (santoor, tanpura, tabla, piano), rendered offline |
| Export | `src/export/exportVideo.js` | WebCodecs H.264 + AAC → `mp4-muxer`; MediaRecorder fallback |

### Adding a template

Copy `src/engine/templates/minimal.js`, change the palette, fonts and draw functions, and register it in `templates/index.js`. The shared scenes in `scenes.js` handle layout and text.

## Browser support

Fast MP4 export needs WebCodecs (Chrome, Edge, Opera, and recent Safari/Firefox). Other browsers record in real time and may produce WebM.
