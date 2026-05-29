<script setup lang="ts">
import { computed, watch, ref, inject, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { Tag } from '../types'
import { NAVBAR_COLLAPSE_KEY } from '../injectionKeys'
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

const navbar = inject(NAVBAR_COLLAPSE_KEY, null)

const collapseRef = ref<HTMLElement | null>(null)
const bsCollapse = ref<BootstrapCollapse | null>(null)
const isVisible = ref(false)
const bsInitialized = ref(false)
// Stores the last desired state requested before Bootstrap finishes initializing.
// Only the last state is preserved (last-wins); intermediate open/close calls
// before bsInitialized are intentionally discarded. Applied once bsInitialized = true.
let pendingState: boolean | null = null

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

    // Guard: component may have unmounted while awaiting the import
    if (!collapseRef.value) return

    bsCollapse.value = new Collapse(collapseRef.value, {
      toggle: false
    }) as BootstrapCollapse

    collapseRef.value.addEventListener('show.bs.collapse', onShow)
    collapseRef.value.addEventListener('shown.bs.collapse', onShown)
    collapseRef.value.addEventListener('hide.bs.collapse', onHide)
    collapseRef.value.addEventListener('hidden.bs.collapse', onHidden)

    // Determine desired initial state (navbar state takes precedence).
    // Also honour any state change queued by the watcher during the async gap.
    const initialState = pendingState !== null
      ? pendingState
      : (navbar && props.id in navbar.collapseStates
          ? navbar.collapseStates[props.id]
          : props.modelValue)
    pendingState = null

    // Signal pre-boot fallback to stop; let Vue flush before calling show()
    // so Bootstrap doesn't see our fallback 'show' class and short-circuit.
    bsInitialized.value = true
    await nextTick()

    // Guard: component may have unmounted during nextTick
    if (!bsCollapse.value) return

    if (initialState) {
      bsCollapse.value.show()
    }
  } catch (error) {
    bsInitialized.value = true
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
  if (!bsInitialized.value) {
    // Bootstrap not ready yet — queue the desired state for application after init
    pendingState = newValue
    return
  }

  if (!bsCollapse.value) return

  if (newValue && !isVisible.value) {
    bsCollapse.value.show()
  } else if (!newValue && isVisible.value) {
    bsCollapse.value.hide()
  }
})

// When modelValue changes from outside (programmatic control), sync collapseStates
// so targetState doesn't remain stale after the first toggle.
watch(() => props.modelValue, (val) => {
  if (navbar && props.id in navbar.collapseStates && navbar.collapseStates[props.id] !== val) {
    navbar.collapseStates[props.id] = val
  }
})

watch(bsInitialized, (initialized) => {
  if (!initialized || pendingState === null || !bsCollapse.value) return
  const desired = pendingState
  pendingState = null
  if (desired && !isVisible.value) {
    bsCollapse.value.show()
  } else if (!desired && isVisible.value) {
    bsCollapse.value.hide()
  }
})

const collapseClass = computed(() => {
  const classes = ['collapse']
  if (props.isNav) classes.push('navbar-collapse')
  if (props.horizontal) classes.push('collapse-horizontal')
  // Pre-Bootstrap fallback: add 'show' so content is visible on initial render.
  // Once bsInitialized, Bootstrap owns the class; Vue stops touching it.
  if (!bsInitialized.value && targetState.value) classes.push('show')
  return classes.join(' ')
})
</script>

<template>
  <component :is="tag" ref="collapseRef" :id="id" :class="collapseClass">
    <slot />
  </component>
</template>
