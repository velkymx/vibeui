<script setup lang="ts">
import { computed, reactive, provide } from 'vue'
import type { Variant, Tag, NavbarPosition } from '../types'
import { NAVBAR_COLLAPSE_KEY } from '../injectionKeys'

const props = defineProps({
  // No default: a plain navbar inherits the page's data-bs-theme (like every other
  // component) and follows light/dark mode. Set an explicit variant for a fixed-color
  // bar — it then derives a contrast-correct data-bs-theme (see navbarTheme).
  variant: { type: String as () => Variant | 'dark' | 'light', default: undefined },
  theme: { type: String as () => 'dark' | 'light', default: undefined },
  expand: { type: [Boolean, String], default: 'lg' },
  container: { type: [Boolean, String], default: true },
  position: { type: String as () => NavbarPosition, default: undefined },
  tag: { type: String as () => Tag | 'nav', default: 'nav' }
})

// Provide reactive collapse state so VibeNavbarToggle and VibeCollapse
// communicate through Vue reactivity instead of Bootstrap JS
const collapseStates = reactive<Record<string, boolean>>({})
const toggleCollapse = (id: string) => {
  collapseStates[id] = !collapseStates[id]
}
provide(NAVBAR_COLLAPSE_KEY, { collapseStates, toggleCollapse })

const navbarClass = computed(() => {
  const classes = ['navbar']

  if (props.expand === true) {
    classes.push('navbar-expand')
  } else if (typeof props.expand === 'string') {
    classes.push(`navbar-expand-${props.expand}`)
  }

  if (props.variant) classes.push(`bg-${props.variant}`)

  if (props.position) {
    classes.push(props.position)
  }

  return classes.join(' ')
})

// Bootstrap 5.3 uses data-bs-theme instead of deprecated navbar-dark/navbar-light
// classes. Derive it from the variant's luminance so a colored navbar
// (bg-primary/success/…) gets light text instead of dark-on-dark. An explicit
// `theme` prop always wins.
const DARK_NAVBAR_VARIANTS = new Set(['primary', 'secondary', 'success', 'danger', 'dark'])
const navbarTheme = computed(() => {
  if (props.theme) return props.theme
  if (!props.variant) return undefined
  return DARK_NAVBAR_VARIANTS.has(props.variant) ? 'dark' : 'light'
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

<style scoped>
.navbar.fixed-top,
.navbar.sticky-top {
  padding-top: env(safe-area-inset-top, 0);
}

.navbar.fixed-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
