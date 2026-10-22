import { useEffect, useState } from 'react'
import { loadAssets } from '../engine/assets.js'
import { createInvitation } from '../engine/renderer.js'

/** Build (and rebuild, debounced) the renderer for the current data. */
export function useInvitation(data, delay = 250) {
  const [state, setState] = useState({ invitation: null, assets: null, error: null })
  const key = JSON.stringify(data)

  useEffect(() => {
    let cancelled = false
    const id = setTimeout(async () => {
      try {
        const assets = await loadAssets(data)
        if (!cancelled) setState({ invitation: createInvitation(data, assets), assets, error: null })
      } catch (error) {
        if (!cancelled) setState((s) => ({ ...s, error }))
      }
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [key, delay])

  return state
}
