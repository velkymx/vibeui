<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  height: { type: String, default: undefined }
})

const emit = defineEmits(['component-error'])

const progressStyle = computed(() => {
  if (props.height) {
    return { height: props.height }
  }
  return undefined
})
</script>

<template>
  <div class="progress" :style="progressStyle">
    <slot />
  </div>
</template>
