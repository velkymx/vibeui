<script setup lang="ts">
const props = defineProps({
  disabled: { type: Boolean, default: false },
  white: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Close' }
})

import type { ComponentError } from '../types'

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'component-error', error: ComponentError): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    type="button"
    :class="['btn-close', { 'btn-close-white': white }]"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @click="handleClick"
  />
</template>
