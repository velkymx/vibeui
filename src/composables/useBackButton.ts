import { onMounted, onUnmounted } from 'vue'

type CloseAction = () => void

const closeables: CloseAction[] = []

/**
 * Global handler for the backbutton event.
 * Common in hybrid apps (Capacitor/Cordova) to handle the Android hardware back button.
 */
function handleBackButton(event: Event) {
  if (closeables.length > 0) {
    // If we have an active layer (modal, offcanvas, etc.), 
    // we stop the default behavior and close the layer instead.
    event.preventDefault()
    const close = closeables.pop()
    if (close) close()
  }
}

/**
 * Composable to manage closing active UI layers when the hardware back button is pressed.
 * Useful for Android devices in hybrid mobile environments.
 * 
 * @param closeAction The function to call when the back button is pressed.
 */
export function useBackButton(closeAction: CloseAction) {
  onMounted(() => {
    closeables.push(closeAction)
    
    // Add the listener once globally on document
    if (closeables.length === 1 && typeof document !== 'undefined') {
      document.addEventListener('backbutton', handleBackButton)
    }
  })

  onUnmounted(() => {
    const index = closeables.indexOf(closeAction)
    if (index !== -1) {
      closeables.splice(index, 1)
    }

    if (closeables.length === 0 && typeof document !== 'undefined') {
      document.removeEventListener('backbutton', handleBackButton)
    }
  })
}
