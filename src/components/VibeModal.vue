<script setup lang="ts">
import { computed } from 'vue'
import type { Size } from '../types'

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String as () => Size | 'xl', default: undefined },
  centered: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  fullscreen: { type: [Boolean, String], default: false },
  staticBackdrop: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const dialogClass = computed(() => {
  const classes = ['modal-dialog']
  if (props.size) classes.push(`modal-${props.size}`)
  if (props.centered) classes.push('modal-dialog-centered')
  if (props.scrollable) classes.push('modal-dialog-scrollable')

  if (props.fullscreen === true) {
    classes.push('modal-fullscreen')
  } else if (typeof props.fullscreen === 'string') {
    classes.push(`modal-fullscreen-${props.fullscreen}-down`)
  }

  return classes.join(' ')
})
</script>

<template>
  <div
    :id="id"
    class="modal fade"
    tabindex="-1"
    :aria-labelledby="`${id}-label`"
    aria-hidden="true"
    :data-bs-backdrop="staticBackdrop ? 'static' : undefined"
    :data-bs-keyboard="!staticBackdrop"
  >
    <div :class="dialogClass">
      <div class="modal-content">
        <div v-if="!hideHeader" class="modal-header">
          <h5 :id="`${id}-label`" class="modal-title">
            <slot name="header">{{ title }}</slot>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="!hideFooter" class="modal-footer">
          <slot name="footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
