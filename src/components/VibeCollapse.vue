<script setup lang="ts">
import { reportComponentError } from '../utils/reportComponentError'
import { useBootstrapInstance } from '../composables/useBootstrapInstance'
import { useTemplateRef, computed, watch, ref, inject, nextTick, onMounted } from 'vue'
import type { Tag, ComponentError } from '../types'
import { NAVBAR_COLLAPSE_KEY } from '../injectionKeys'
import { useId } from '../composables/useId'

interface BootstrapCollapse {
  show: () => void
  hide: () => void
  toggle: () => void
  dispose: () => void
}

// Hoisted to setup so the id is owned by this instance and stable (useId() in a
// defineProps default factory runs during prop normalization — fragile across Vue versions).
const _generatedId = useId('collapse')

const props = defineProps({
  id: { type: String, default: undefined },
  modelValue: { type: Boolean, default: false },
  tag: { type: String as () => Tag, default: 'div' },
  horizontal: { type: Boolean, default: false },
  isNav: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'show'): void
  (e: 'shown'): void
  (e: 'hide'): void
  (e: 'hidden'): void
  (e: 'component-error', error: ComponentError): void
}>()

const navbar = inject(NAVBAR_COLLAPSE_KEY, null)

const computedId = computed(() => props.id || _generatedId)

const collapseRef = useTemplateRef<HTMLElement>('collapseRef')
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

// Instance lifecycle owned by the shared composable (#247): lazy async
// construction, per-instance collapse listeners, dispose plus nulling, and
// unmount-race guards. Initial-state resolution plus the pre-boot fallback
// handoff stay here.
const { init: initInstance, instance: bsCollapse } = useBootstrapInstance<BootstrapCollapse>({
  // Template ref read at call time: it may be null during teardown, which the
  // composable treats as a no-op instead of constructing on a detached node.
  resolveElement: () => collapseRef.value,
  create: (el, bootstrap) =>
    new bootstrap.Collapse(el, {
      toggle: false
    }) as unknown as BootstrapCollapse,
  disposeInstance: (collapse) => collapse.dispose(),
  events: {
    'show.bs.collapse': onShow as EventListener,
    'shown.bs.collapse': onShown as EventListener,
    'hide.bs.collapse': onHide as EventListener,
    'hidden.bs.collapse': onHidden as EventListener
  },
  componentName: 'VibeCollapse',
  onError: (error) => reportComponentError(emit, error)
})

const initCollapse = async (): Promise<void> => {
  if (!collapseRef.value) return
  await initInstance()
  if (!collapseRef.value) return

  // Determine desired initial state (navbar state takes precedence).
  // Also honour any state change queued by the watcher during the async gap.
  const initialState = pendingState !== null
    ? pendingState
    : (navbar && computedId.value in navbar.collapseStates
        ? navbar.collapseStates[computedId.value]
        : props.modelValue)
  pendingState = null

  // Signal pre-boot fallback to stop; let Vue flush before calling show()
  // so Bootstrap doesn't see our fallback 'show' class and short-circuit.
  bsInitialized.value = true
  await nextTick()

  if (initialState) {
    bsCollapse.value?.show()
  }
}

onMounted(initCollapse)

// Combined state from navbar or local modelValue
const targetState = computed(() => {
  if (navbar && computedId.value in navbar.collapseStates) {
    return navbar.collapseStates[computedId.value]
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
  if (navbar && computedId.value in navbar.collapseStates && navbar.collapseStates[computedId.value] !== val) {
    navbar.collapseStates[computedId.value] = val
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
  <component :is="tag" ref="collapseRef" :id="computedId" :class="collapseClass">
    <slot />
  </component>
</template>
