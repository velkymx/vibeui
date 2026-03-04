<script setup lang="ts">
import { computed, reactive, provide } from 'vue'
import type { Variant, Tag, NavbarPosition } from '../types'

const props = defineProps({
  variant: { type: String as () => Variant | 'dark' | 'light', default: 'light' },
  theme: { type: String as () => 'dark' | 'light', default: undefined },
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

  classes.push(`bg-${props.variant}`)

  if (props.position) {
    classes.push(props.position)
  }

  return classes.join(' ')
})

// Bootstrap 5.3 uses data-bs-theme instead of deprecated navbar-dark/navbar-light classes
const navbarTheme = computed(() => {
  if (props.theme) return props.theme
  if (props.variant === 'dark') return 'dark'
  if (props.variant === 'light') return 'light'
  return undefined
})

const containerClass = computed(() => {
  if (props.container === false) return undefined
  if (props.container === true) return 'container-fluid'
  return `container-${props.container}`
})
</script>

<template>
  <component :is="tag" :class="navbarClass" :data-bs-theme="navbarTheme">
    <div v-if="containerClass" :class="containerClass">
      <slot />
    </div>
    <slot v-else />
  </component>
</template>
