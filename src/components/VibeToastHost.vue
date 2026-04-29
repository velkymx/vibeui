<script setup lang="ts">
import { computed } from 'vue'
import VibeToast from './VibeToast.vue'
import { __toastStore, useToast, type ToastSpec } from '../composables/useToast'
import type { ToastPlacement } from '../types'

const props = defineProps({
  defaultPlacement: { type: String as () => ToastPlacement, default: 'top-end' }
})

const { dismiss } = useToast()

const grouped = computed<Record<ToastPlacement, ToastSpec[]>>(() => {
  const out = {} as Record<ToastPlacement, ToastSpec[]>
  for (const t of __toastStore.toasts) {
    const placement = t.placement ?? props.defaultPlacement
    if (!out[placement]) out[placement] = []
    out[placement].push(t)
  }
  return out
})
</script>

<template>
  <template v-for="(list, placement) in grouped" :key="placement">
    <VibeToast
      v-for="t in list"
      :key="t.id"
      :model-value="true"
      :title="t.title || ''"
      :variant="t.variant"
      :placement="placement"
      :autohide="t.autohide ?? true"
      :delay="t.delay ?? 5000"
      @hidden="dismiss(t.id)"
    >
      {{ t.body }}
    </VibeToast>
  </template>
</template>
