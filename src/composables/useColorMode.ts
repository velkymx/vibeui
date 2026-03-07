import { ref } from 'vue'
import type { ColorMode } from '../types'

const STORAGE_KEY = 'vibe-color-mode'

/**
 * Maps each mode to the next in the toggle cycle.
 * Also serves as the single source of truth for valid modes.
 */
const NEXT_MODE: Record<ColorMode, ColorMode> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light'
}

/**
 * Singleton composable — all calls share the same `colorMode` ref.
 * Call `initColorMode()` once at app startup to restore the persisted preference.
 */
const colorMode = ref<ColorMode>('auto')
let initialized = false

function applyColorMode(mode: ColorMode) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-bs-theme', mode)
}

export function useColorMode() {
  function setColorMode(mode: ColorMode) {
    if (!(mode in NEXT_MODE)) return
    colorMode.value = mode
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // localStorage may be unavailable (e.g. SSR or private browsing)
    }
    applyColorMode(mode)
  }

  function initColorMode() {
    if (initialized) return
    let stored: ColorMode = 'auto'
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'light' || raw === 'dark' || raw === 'auto') {
        stored = raw
      }
    } catch {
      // ignore
    }
    setColorMode(stored)
    initialized = true
  }

  function toggleColorMode() {
    setColorMode(NEXT_MODE[colorMode.value])
  }

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
    initColorMode
  }
}

/** For testing only — not re-exported from the package index. */
export function _resetColorMode() {
  colorMode.value = 'auto'
  initialized = false
  if (typeof document !== 'undefined') {
    document.documentElement.removeAttribute('data-bs-theme')
  }
}
