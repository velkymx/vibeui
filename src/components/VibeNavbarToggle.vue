<script setup lang="ts">
import { inject, computed } from 'vue'

const props = defineProps({
  target: { type: String, required: true },
  ariaLabel: { type: String, default: 'Toggle navigation' }
})

const emit = defineEmits(['component-error'])

const navbar = inject<{
  collapseStates: Record<string, boolean>
  toggleCollapse: (id: string) => void
} | null>('vibeNavbarCollapse', null)

const isExpanded = computed(() => navbar?.collapseStates[props.target] ?? false)

const handleClick = () => {
  if (navbar) {
    navbar.toggleCollapse(props.target)
  }
}
</script>

<template>
  <button
    class="navbar-toggler"
    type="button"
    :aria-controls="target"
    :aria-expanded="isExpanded"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <span class="navbar-toggler-icon"></span>
  </button>
</template>
