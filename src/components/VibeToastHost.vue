<script setup lang="ts">
import { computed } from 'vue'
import VibeToast from './VibeToast.vue'
import { __toastStore, useToast, type ToastSpec } from '../composables/useToast'
import type { ToastPlacement } from '../types'

const props = defineProps({
  defaultPlacement: { type: String as () => ToastPlacement, default: 'top-end' }
})

const { dismiss } = useToast()

const grouped = computed<Array<{ placement: ToastPlacement; toasts: ToastSpec[] }>>(() => {
  const buckets = new Map<ToastPlacement, ToastSpec[]>()
  for (const t of __toastStore.toasts) {
    const placement = t.placement ?? props.defaultPlacement
    const list = buckets.get(placement)
    if (list) list.push(t)
    else buckets.set(placement, [t])
  }
  return Array.from(buckets.entries()).map(([placement, toasts]) => ({ placement, toasts }))
})

const containerClassFor = (p: ToastPlacement): string => {
  const classes = ['toast-container', 'position-fixed', 'p-3']
  if (p.includes('top')) classes.push('top-0')
  if (p.includes('bottom')) classes.push('bottom-0')
  if (p.includes('middle')) classes.push('top-50', 'start-50', 'translate-middle')
  if (p.includes('start')) classes.push('start-0')
  if (p.includes('end')) classes.push('end-0')
  if (p.includes('center') && !p.includes('middle')) classes.push('start-50', 'translate-middle-x')
  return classes.join(' ')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-for="group in grouped"
      :key="group.placement"
      :class="containerClassFor(group.placement)"
      style="z-index: 1090"
    >
      <VibeToast
        v-for="t in group.toasts"
        :key="t.id"
        no-container
        :model-value="true"
        :title="t.title || ''"
        :variant="t.variant"
        :placement="group.placement"
        :autohide="t.autohide ?? true"
        :delay="t.delay ?? 5000"
        @hidden="dismiss(t.id)"
      >
        {{ t.body }}
      </VibeToast>
    </div>
  </Teleport>
</template>
