import './global-components'
import './global-directives'
import VibeUIPlugin from './components'

export * from './components'
export * from './types'
export * from './composables/useFormValidation'
export * from './composables/useForm'
export { vTooltip } from './directives/vTooltip'
export { useToast, resetToastStoreForSSR } from './composables/useToast'
export type { ToastSpec, ToastShowOptions, UseToastReturn } from './composables/useToast'
export { usePosition } from './composables/usePosition'
export type { UsePositionOptions, UsePositionReturn } from './composables/usePosition'
export { useId } from './composables/useId'
export { VIBE_WYSIWYG_KEY } from './composables/wysiwygConfig'
export { makeDomPurifySanitizer, WYSIWYG_PURIFY_CONFIG } from './utils/sanitizeHtml'
export { useColorMode, initColorModeEager } from './composables/useColorMode'
export { useBreakpoints } from './composables/useBreakpoints'
export { useBackButton } from './composables/useBackButton'
export { useEventBus, resetEventBusForSSR } from './composables/useEventBus'
export type { VibeEventBus } from './composables/useEventBus'
export {
  emitNotificationShow,
  emitNotificationDismiss,
  onNotificationShown,
  onNotificationDismissed,
  emitModalOpen,
  emitModalClose,
  onBeforeModalOpen,
  onBeforeModalClose,
  onModalOpened,
  onModalClosed,
  emitThemeSet,
  onThemeChanged,
  emitOffcanvasOpen,
  emitOffcanvasClose,
  emitOffcanvasToggle,
  onOffcanvasOpened,
  onOffcanvasClosed,
  emitLayoutSidebarToggle,
  onLayoutSidebarToggled,
  emitNavBreadcrumbUpdate,
  onNavBreadcrumbUpdated,
} from './composables/eventHelpers'

// Export the plugin as default for app.use(VibeUI)
export default VibeUIPlugin
