import { onMounted, onUnmounted } from 'vue'

type CloseAction = () => void

// Bug fix: track by a per-mount unique token instead of function reference to
// avoid stale refs from HMR or missed onUnmounted teardowns.
const closeables: Array<{ token: symbol; action: CloseAction }> = []

/**
 * Global handler for the backbutton event.
 * Common in hybrid apps (Capacitor/Cordova) to handle the Android hardware back button.
 */
function handleBackButton(event: Event) {
  if (closeables.length > 0) {
    // If we have an active layer (modal, offcanvas, etc.),
    // we stop the default behavior and close the layer instead.
    event.preventDefault()
    const entry = closeables.pop()
    if (entry) entry.action()
  }
}

/**
 * Composable to manage closing active UI layers when the hardware back button is pressed.
 * Useful for Android devices in hybrid mobile environments.
 *
 * @param closeAction The function to call when the back button is pressed.
 */
export function useBackButton(closeAction: CloseAction) {
  // Bug fix: use a unique symbol token per mount to allow reliable removal
  const token = Symbol()

  onMounted(() => {
    closeables.push({ token, action: closeAction })

    // Add the listener once globally on document
    if (closeables.length === 1 && typeof document !== 'undefined') {
      document.addEventListener('backbutton', handleBackButton)
    }
  })

  onUnmounted(() => {
    const idx = closeables.findIndex(c => c.token === token)
    if (idx !== -1) {
      closeables.splice(idx, 1)
    }

    if (closeables.length === 0 && typeof document !== 'undefined') {
      document.removeEventListener('backbutton', handleBackButton)
    }
  })
}
