import VibeUIPlugin from './components'

export * from './components'
export * from './types'
export * from './composables/useFormValidation'
export * from './composables/useForm'
export { vTooltip } from './directives/vTooltip'
export { useToast } from './composables/useToast'
export type { ToastSpec, ToastShowOptions, UseToastReturn } from './composables/useToast'
export { usePosition } from './composables/usePosition'
export type { UsePositionOptions, UsePositionReturn } from './composables/usePosition'
export { useId } from './composables/useId'
export { useColorMode } from './composables/useColorMode'
export { useBreakpoints } from './composables/useBreakpoints'
export { useBackButton } from './composables/useBackButton'

// Export the plugin as default for app.use(VibeUI)
export default VibeUIPlugin
