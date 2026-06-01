<script setup lang="ts">
const props = defineProps({
  disabled: { type: Boolean, default: false },
  white: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Close' }
})

const emit = defineEmits(['click', 'component-error'])

const handleClick = (event: Event) => {
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
