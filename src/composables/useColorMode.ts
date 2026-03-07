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

/** Sets the reactive ref and applies data-bs-theme to the DOM. Does not touch storage. */
function applyAndUpdate(mode: ColorMode) {
  colorMode.value = mode
  applyColorMode(mode)
}

// Sync DOM with the initial default immediately on module load.
// Prevents a flash where colorMode.value says 'auto' but <html> has no data-bs-theme.
applyAndUpdate('auto')

export function useColorMode() {
  function setColorMode(mode: ColorMode) {
    if (!(mode in NEXT_MODE)) return
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // localStorage may be unavailable (e.g. SSR or private browsing)
    }
    applyAndUpdate(mode)
  }

  function initColorMode() {
    if (initialized) return
    let stored: ColorMode = 'auto'
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw !== null && raw in NEXT_MODE) {
        stored = raw as ColorMode
      }
    } catch {
      // ignore
    }
    applyAndUpdate(stored)
    initialized = true
  }

  function clearColorMode() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore — ref and DOM still reset even if storage removal fails
    }
    initialized = false
    applyAndUpdate('auto')
  }

  function toggleColorMode() {
    setColorMode(NEXT_MODE[colorMode.value] ?? 'auto')
  }

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
    initColorMode,
    clearColorMode
  }
}

/**
 * For testing only — not re-exported from the package index.
 * Resets singleton state and removes the storage key.
 * Must be called in beforeEach to guarantee clean state between tests.
 */
export function _resetColorMode() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore in SSR / stubbed environments
  }
  initialized = false
  applyAndUpdate('auto')
}
