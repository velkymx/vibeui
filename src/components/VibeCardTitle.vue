<script setup lang="ts">
const props = defineProps({
  tag: { type: String, default: 'h5' }
})

const emit = defineEmits(['component-error'])
</script>

<template>
  <component :is="tag" class="card-title">
    <slot />
  </component>
</template>
