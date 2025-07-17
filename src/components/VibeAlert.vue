<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  modelValue: { type: Boolean, default: true },
  dismissable: { type: Boolean, default: false },
  message: { type: String, required: true }
})

const emit = defineEmits(['update:modelValue', 'component-error'])

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const dismiss = () => {
  try {
    visible.value = false
  } catch (error) {
    emit('component-error', {
      message: 'Dismiss failed',
      componentName: 'VibeAlert',
      originalError: error
    })
  }
}
</script>

<template>
  <div v-if="visible" :class="`alert alert-${variant}`" role="alert">
    <slot>{{ message }}</slot>
    <button v-if="dismissable" class="btn-close" @click="dismiss" aria-label="Close"></button>
  </div>
</template>

