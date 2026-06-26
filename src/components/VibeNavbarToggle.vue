<script setup lang="ts">
import { inject, computed } from 'vue'
import { NAVBAR_COLLAPSE_KEY } from '../injectionKeys'

interface BootstrapCollapse {
  toggle: () => void
  show: () => void
  hide: () => void
}

const props = defineProps({
  target: { type: String, required: true },
  ariaLabel: { type: String, default: 'Toggle navigation' }
})

import type { ComponentError } from '../types'

const emit = defineEmits<{
  (e: 'component-error', error: ComponentError): void
}>()

const navbar = inject(NAVBAR_COLLAPSE_KEY, null)

const isExpanded = computed(() => navbar?.collapseStates[props.target] ?? false)

const handleClick = async () => {
  if (navbar) {
    // VibeCollapse (inside the same VibeNavbar) owns the Bootstrap lifecycle.
    // Going through navbar.toggleCollapse keeps Vue collapseStates and Bootstrap DOM in sync.
    navbar.toggleCollapse(props.target)
    return
  }

  // Standalone (no VibeNavbar parent): drive Bootstrap directly.
  try {
    const targetEl = document.getElementById(props.target)
    if (targetEl) {
      const bootstrap = await import('bootstrap')
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(targetEl) as BootstrapCollapse
      bsCollapse.toggle()
    }
  } catch (error) {
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
