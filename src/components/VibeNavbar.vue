<script setup lang="ts">
import { computed, reactive, provide } from 'vue'
import type { Variant, Tag, NavbarPosition } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant | 'dark' | 'light', default: 'light' },
  expand: { type: [Boolean, String], default: 'lg' },
  container: { type: [Boolean, String], default: true },
  position: { type: String as () => NavbarPosition, default: undefined },
  tag: { type: String as () => Tag | 'nav', default: 'nav' }
})

const emit = defineEmits(['component-error'])

// Provide reactive collapse state so VibeNavbarToggle and VibeCollapse
// communicate through Vue reactivity instead of Bootstrap JS
const collapseStates = reactive<Record<string, boolean>>({})
const toggleCollapse = (id: string) => {
  collapseStates[id] = !collapseStates[id]
}
provide('vibeNavbarCollapse', { collapseStates, toggleCollapse })

const navbarClass = computed(() => {
  const classes = ['navbar']

  if (props.expand === true) {
    classes.push('navbar-expand')
  } else if (typeof props.expand === 'string') {
    classes.push(`navbar-expand-${props.expand}`)
  }

  if (props.variant === 'dark' || props.variant === 'light') {
    classes.push(`navbar-${props.variant}`, `bg-${props.variant}`)
  } else {
    classes.push(`bg-${props.variant}`)
  }

  if (props.position) {
    classes.push(props.position)
  }

  return classes.join(' ')
})

const containerClass = computed(() => {
  if (props.container === false) return undefined
  if (props.container === true) return 'container-fluid'
  return `container-${props.container}`
})
</script>

<template>
  <component :is="tag" :class="navbarClass">
    <div v-if="containerClass" :class="containerClass">
      <slot />
    </div>
    <slot v-else />
  </component>
</template>
