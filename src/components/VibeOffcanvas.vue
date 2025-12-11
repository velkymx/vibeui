<script setup lang="ts">
import { computed } from 'vue'
import type { OffcanvasPlacement } from '../types'

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  placement: { type: String as () => OffcanvasPlacement, default: 'start' },
  backdrop: { type: [Boolean, String], default: true },
  scroll: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const offcanvasClass = computed(() => {
  return `offcanvas offcanvas-${props.placement}`
})
</script>

<template>
  <div
    :id="id"
    :class="offcanvasClass"
    tabindex="-1"
    :aria-labelledby="`${id}-label`"
    :data-bs-backdrop="backdrop === false ? 'false' : backdrop === 'static' ? 'static' : 'true'"
    :data-bs-scroll="scroll"
  >
    <div class="offcanvas-header">
      <h5 :id="`${id}-label`" class="offcanvas-title">
        <slot name="header">{{ title }}</slot>
      </h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <slot />
    </div>
  </div>
</template>
