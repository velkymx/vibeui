<script setup lang="ts">
import { computed } from 'vue'
import type { Variant } from '../types'

const props = defineProps({
  id: { type: String, default: undefined },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  variant: { type: String as () => Variant, default: undefined },
  autohide: { type: Boolean, default: true },
  delay: { type: Number, default: 5000 }
})

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const toastClass = computed(() => {
  const classes = ['toast']
  if (props.variant) classes.push(`text-bg-${props.variant}`)
  return classes.join(' ')
})
</script>

<template>
  <div
    :id="id"
    :class="toastClass"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    :data-bs-autohide="autohide"
    :data-bs-delay="delay"
  >
    <div v-if="title || $slots.header" class="toast-header">
      <slot name="header">
        <strong class="me-auto">{{ title }}</strong>
      </slot>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      <slot />
    </div>
  </div>
</template>
