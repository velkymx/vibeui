<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import type { ComponentError } from '../types'
import { reportComponentError } from '../utils/reportComponentError'

const emit = defineEmits<{
  (e: 'error', err: unknown): void
  (e: 'component-error', error: ComponentError): void
}>()

// #157: type the fallback slot (error plus recovery).
defineSlots<{
  default?: () => unknown
  fallback?: (props: { error: unknown; reset: () => void }) => unknown
}>()

// The captured descendant error. Non-null renders the fallback instead of the
// default slot, containing the failure to this subtree.
const error = ref<unknown>(null)

onErrorCaptured((err) => {
  error.value = err
  reportComponentError(emit, {
    message: 'Captured by VibeErrorBoundary.',
    componentName: 'VibeErrorBoundary',
    originalError: err,
  })
  emit('error', err)
  // Stop propagation: this boundary handled it.
  return false
})

// Clears the error and re-renders the default slot. If the child still throws,
// the boundary captures again (by design: reset recovers only fixed content).
function reset() {
  error.value = null
}

defineExpose({ reset })
</script>

<template>
  <slot v-if="error" name="fallback" :error="error" :reset="reset">
    <div class="alert alert-danger" role="alert">
      Something went wrong rendering this section.
    </div>
  </slot>
  <slot v-else />
</template>
