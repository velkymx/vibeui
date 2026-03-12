import VibeUIPlugin from './components'

export * from './components'
export * from './types'
export * from './composables/useFormValidation'
export { useId } from './composables/useId'
export { useColorMode } from './composables/useColorMode'
export { useBreakpoints } from './composables/useBreakpoints'

// Export the plugin as default for app.use(VibeUI)
export default VibeUIPlugin
