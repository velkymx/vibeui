<script setup lang="ts">
import { inject, computed } from 'vue'

interface BootstrapCollapse {
  toggle: () => void
  show: () => void
  hide: () => void
}

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

const handleClick = async () => {
  if (navbar) navbar.toggleCollapse(props.target)

  try {
    const targetEl = document.getElementById(props.target)
    if (targetEl) {
      const bootstrap = await import('bootstrap')
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(targetEl) as BootstrapCollapse
      bsCollapse.toggle()
    }
  } catch (error) {
    if (navbar) navbar.toggleCollapse(props.target)
    emit('component-error', { message: 'Bootstrap JS toggle failed.', componentName: 'VibeNavbarToggle', originalError: error })
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
