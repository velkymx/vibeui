<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { OffcanvasPlacement } from '../types'
import { useId } from '../composables/useId'

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

const emit = defineEmits(['update:modelValue', 'show', 'shown', 'hide', 'hidden', 'component-error'])

const offcanvasRef = ref<HTMLElement | null>(null)
const bsOffcanvas = ref<BootstrapOffcanvas | null>(null)
const isVisible = ref(false)

const offcanvasClass = computed(() => `offcanvas offcanvas-${props.placement}`)

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

const initOffcanvas = async () => {
  if (!offcanvasRef.value) return

  if (bsOffcanvas.value) {
    bsOffcanvas.value.dispose()
  }

  try {
    const bootstrap = await import('bootstrap')
    const Offcanvas = bootstrap.Offcanvas

    bsOffcanvas.value = new Offcanvas(offcanvasRef.value, {
      backdrop: props.backdrop === false ? false : props.backdrop === 'static' ? 'static' : true,
      scroll: props.scroll,
      keyboard: props.backdrop !== 'static'
    }) as BootstrapOffcanvas

    offcanvasRef.value.addEventListener('show.bs.offcanvas', onShow)
    offcanvasRef.value.addEventListener('shown.bs.offcanvas', onShown)
    offcanvasRef.value.addEventListener('hide.bs.offcanvas', onHide)
    offcanvasRef.value.addEventListener('hidden.bs.offcanvas', onHidden)

    if (props.modelValue) {
      bsOffcanvas.value.show()
    }
  } catch (error) {
    emit('component-error', {
      message: 'Bootstrap JS not loaded. Offcanvas will use data attributes only.',
      componentName: 'VibeOffcanvas',
      originalError: error
    })
  }
}

onMounted(initOffcanvas)

onBeforeUnmount(() => {
  if (offcanvasRef.value) {
    offcanvasRef.value.removeEventListener('show.bs.offcanvas', onShow)
    offcanvasRef.value.removeEventListener('shown.bs.offcanvas', onShown)
    offcanvasRef.value.removeEventListener('hide.bs.offcanvas', onHide)
    offcanvasRef.value.removeEventListener('hidden.bs.offcanvas', onHidden)
  }

  if (bsOffcanvas.value) {
    if (isVisible.value) {
      bsOffcanvas.value.hide()
    }
    bsOffcanvas.value.dispose()
    bsOffcanvas.value = null
  }
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
</style>
