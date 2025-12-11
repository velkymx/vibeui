<script setup lang="ts">
const props = defineProps({
  tag: { type: String, default: 'p' }
})

const emit = defineEmits(['component-error'])
</script>

<template>
  <component :is="tag" class="card-text">
    <slot />
  </component>
</template>
