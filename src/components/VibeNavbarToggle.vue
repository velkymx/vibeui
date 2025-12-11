<script setup lang="ts">
const props = defineProps({
  target: { type: String, required: true },
  ariaLabel: { type: String, default: 'Toggle navigation' }
})

const emit = defineEmits(['component-error'])
</script>

<template>
  <button
    class="navbar-toggler"
    type="button"
    data-bs-toggle="collapse"
    :data-bs-target="`#${target}`"
    :aria-controls="target"
    aria-expanded="false"
    :aria-label="ariaLabel"
  >
    <span class="navbar-toggler-icon"></span>
  </button>
</template>
