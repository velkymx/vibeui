<script setup lang="ts">
import { computed, watch, ref, inject } from 'vue'
import type { Tag } from '../types'

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  tag: { type: String as () => Tag, default: 'div' },
  horizontal: { type: Boolean, default: false },
  isNav: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const navbar = inject<{
  collapseStates: Record<string, boolean>
} | null>('vibeNavbarCollapse', null)

// Local visibility for standalone (v-model) usage
const isVisible = ref(props.modelValue)
watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal
})

// When inside a VibeNavbar, use the injected collapse state;
// otherwise fall back to local v-model state
const navbarVisible = computed(() => {
  if (navbar && props.id in navbar.collapseStates) {
    return navbar.collapseStates[props.id]
  }
  return isVisible.value
})

const collapseClass = computed(() => {
  const classes = ['collapse']
  if (props.isNav) classes.push('navbar-collapse')
  if (props.horizontal) classes.push('collapse-horizontal')
  if (navbarVisible.value) classes.push('show')
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" :id="id" :class="collapseClass">
    <slot />
  </component>
</template>
