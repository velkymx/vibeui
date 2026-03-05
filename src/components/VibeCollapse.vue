<script setup lang="ts">
import { computed, watch, ref, inject, onMounted, onBeforeUnmount } from 'vue'
import type { Tag } from '../types'
import { useId } from '../composables/useId'

interface BootstrapCollapse {
  show: () => void
  hide: () => void
  toggle: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, default: () => useId('collapse') },
  modelValue: { type: Boolean, default: false },
  tag: { type: String as () => Tag, default: 'div' },
  horizontal: { type: Boolean, default: false },
  isNav: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const navbar = inject<{
  collapseStates: Record<string, boolean>
} | null>('vibeNavbarCollapse', null)

const collapseRef = ref<HTMLElement | null>(null)
const bsCollapse = ref<BootstrapCollapse | null>(null)
const isVisible = ref(false)

const onShow = () => {
  isVisible.value = true
  emit('show')
}

const onShown = () => {
  emit('shown')
  emit('update:modelValue', true)
}

const onHide = () => {
  emit('hide')
}

const onHidden = () => {
  isVisible.value = false
  emit('hidden')
  emit('update:modelValue', false)
}

onMounted(async () => {
  if (!collapseRef.value) return

  try {
    const bootstrap = await import('bootstrap')
    const Collapse = bootstrap.Collapse

    bsCollapse.value = new Collapse(collapseRef.value, {
      toggle: false
    }) as BootstrapCollapse

    collapseRef.value.addEventListener('show.bs.collapse', onShow)
    collapseRef.value.addEventListener('shown.bs.collapse', onShown)
    collapseRef.value.addEventListener('hide.bs.collapse', onHide)
    collapseRef.value.addEventListener('hidden.bs.collapse', onHidden)

    const initialState = navbar && props.id in navbar.collapseStates 
      ? navbar.collapseStates[props.id] 
      : props.modelValue

    if (initialState) {
      bsCollapse.value.show()
    }
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Collapse will use CSS classes only.',
      componentName: 'VibeCollapse',
      originalError: error
    })
  }
})

onBeforeUnmount(() => {
  if (collapseRef.value) {
    collapseRef.value.removeEventListener('show.bs.collapse', onShow)
    collapseRef.value.removeEventListener('shown.bs.collapse', onShown)
    collapseRef.value.removeEventListener('hide.bs.collapse', onHide)
    collapseRef.value.removeEventListener('hidden.bs.collapse', onHidden)
  }

  if (bsCollapse.value) {
    bsCollapse.value.dispose()
    bsCollapse.value = null
  }
})

// Combined state from navbar or local modelValue
const targetState = computed(() => {
  if (navbar && props.id in navbar.collapseStates) {
    return navbar.collapseStates[props.id]
  }
  return props.modelValue
})

watch(targetState, (newValue) => {
  if (!bsCollapse.value) return

  if (newValue && !isVisible.value) {
    bsCollapse.value.show()
  } else if (!newValue && isVisible.value) {
    bsCollapse.value.hide()
  }
})

const collapseClass = computed(() => {
  const classes = ['collapse']
  if (props.isNav) classes.push('navbar-collapse')
  if (props.horizontal) classes.push('collapse-horizontal')
  // We don't add 'show' manually here if we use Bootstrap JS, 
  // as it will manage the classes. But for initial state or fallback:
  if (!bsCollapse.value && targetState.value) classes.push('show')
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" ref="collapseRef" :id="id" :class="collapseClass">
    <slot />
  </component>
</template>
