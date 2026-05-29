<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { OffcanvasPlacement, ComponentError } from '../types'
import { useId } from '../composables/useId'
import { useBackButton } from '../composables/useBackButton'

interface BootstrapOffcanvas {
  show: () => void
  hide: () => void
  dispose: () => void
}

const props = defineProps({
  id: { type: String, default: () => useId('offcanvas') },
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  placement: { type: String as () => OffcanvasPlacement, default: 'start' },
  backdrop: { type: [Boolean, String], default: true },
  scroll: { type: Boolean, default: false },
  teleport: { type: [String, Boolean], default: 'body' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'show'): void
  (e: 'shown'): void
  (e: 'hide'): void
  (e: 'hidden'): void
  (e: 'component-error', error: ComponentError): void
}>()

const offcanvasRef = ref<HTMLElement | null>(null)
const bsOffcanvas = ref<BootstrapOffcanvas | null>(null)
const isVisible = ref(false)

// Bug 1: in-flight guard to prevent concurrent async init races
let initInFlight = false

// Bug 4: track whether listeners are attached to prevent stacking
let listenersAttached = false

// Set first in onBeforeUnmount — guards the post-await section against constructing
// a Bootstrap Offcanvas instance on a detached element during a mount/unmount race.
let isUnmounted = false

const offcanvasClass = computed(() => `offcanvas offcanvas-${props.placement}`)

// Bug 3: isVisible is now set in onShown (not onShow) to align with modelValue emit
const onShow = () => {
  emit('show')
}

const onShown = () => {
  isVisible.value = true
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

// Bug 4: listener attach/detach helpers
function attachListeners() {
  if (listenersAttached || !offcanvasRef.value) return
  offcanvasRef.value.addEventListener('show.bs.offcanvas', onShow)
  offcanvasRef.value.addEventListener('shown.bs.offcanvas', onShown)
  offcanvasRef.value.addEventListener('hide.bs.offcanvas', onHide)
  offcanvasRef.value.addEventListener('hidden.bs.offcanvas', onHidden)
  listenersAttached = true
}

function detachListeners() {
  if (!listenersAttached || !offcanvasRef.value) return
  offcanvasRef.value.removeEventListener('show.bs.offcanvas', onShow)
  offcanvasRef.value.removeEventListener('shown.bs.offcanvas', onShown)
  offcanvasRef.value.removeEventListener('hide.bs.offcanvas', onHide)
  offcanvasRef.value.removeEventListener('hidden.bs.offcanvas', onHidden)
  listenersAttached = false
}

// Bug 1: async init with in-flight guard
// Bug 4: detach old listeners before dispose, attach after new instance
const initOffcanvas = async () => {
  if (!offcanvasRef.value) return

  // Bug 1: prevent concurrent init races
  if (initInFlight) return
  initInFlight = true

  try {
    if (bsOffcanvas.value) {
      detachListeners()
      bsOffcanvas.value.dispose()
      bsOffcanvas.value = null
    }

    const bootstrap = await import('bootstrap')

    // Guard: component may have unmounted while the import was in-flight.
    if (!offcanvasRef.value || isUnmounted) return

    const Offcanvas = bootstrap.Offcanvas

    bsOffcanvas.value = new Offcanvas(offcanvasRef.value, {
      backdrop: props.backdrop === false ? false : props.backdrop === 'static' ? 'static' : true,
      scroll: props.scroll,
      keyboard: props.backdrop !== 'static'
    }) as BootstrapOffcanvas

    attachListeners()

    if (props.modelValue) {
      bsOffcanvas.value.show()
    }
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Offcanvas will use data attributes only.',
      componentName: 'VibeOffcanvas',
      originalError: error
    })
  } finally {
    initInFlight = false
  }
}

onMounted(initOffcanvas)

// Bug 2: just call dispose() directly — Bootstrap handles cleanup internally
// Bug 4: detach listeners before dispose
onBeforeUnmount(() => {
  isUnmounted = true
  detachListeners()
  bsOffcanvas.value?.dispose()
  bsOffcanvas.value = null
})

watch(() => props.modelValue, (newValue) => {
  if (!bsOffcanvas.value) return
  if (newValue && !isVisible.value) {
    bsOffcanvas.value.show()
  } else if (!newValue && isVisible.value) {
    bsOffcanvas.value.hide()
  }
})

// Re-init on config change
watch([() => props.placement, () => props.backdrop, () => props.scroll], initOffcanvas)

const show = () => bsOffcanvas.value?.show()
const hide = () => bsOffcanvas.value?.hide()

// Support Android back button in hybrid mobile apps
useBackButton(() => {
  if (isVisible.value) hide()
})

defineExpose({ show, hide, bsInstance: bsOffcanvas })
</script>

<template>
  <Teleport :to="teleport === true ? 'body' : (teleport || undefined)" :disabled="!teleport">
    <div
      ref="offcanvasRef"
      :id="id"
      :class="offcanvasClass"
      tabindex="-1"
      :aria-labelledby="`${id}-label`"
      :data-bs-backdrop="backdrop === false ? 'false' : backdrop === 'static' ? 'static' : 'true'"
      :data-bs-scroll="scroll"
    >
      <div class="offcanvas-header">
        <h5 :id="`${id}-label`" class="offcanvas-title">
          <slot name="header">{{ title }}</slot>
        </h5>
        <button type="button" class="btn-close" aria-label="Close" @click="hide"></button>
      </div>
      <div class="offcanvas-body">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.offcanvas.offcanvas-start,
.offcanvas.offcanvas-end {
  height: 100dvh;
}

.offcanvas.offcanvas-top,
.offcanvas.offcanvas-bottom {
  max-height: 100dvh;
}

.offcanvas-header {
  padding-top: calc(1rem + env(safe-area-inset-top, 0));
}

.offcanvas-body {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
}
</style>
