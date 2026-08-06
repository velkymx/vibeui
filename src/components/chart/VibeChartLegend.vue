<script setup lang="ts">
import type { PropType } from 'vue'

export interface ChartLegendItem {
  label: string | number | undefined
  color: string
}

/**
 * Swatch-and-label legend shared by the three chart components. Internal to the
 * library — not registered globally and not exported.
 *
 * The charts differ only in where the entries come from (datasets for line/bar,
 * labels for pie), so they map to this shape and the markup stays in one place.
 */
defineProps({
  position: { type: String as PropType<'top' | 'bottom'>, required: true },
  items: { type: Array as PropType<ChartLegendItem[]>, required: true }
})
</script>

<template>
  <div class="vibe-chart-legend" :class="`vibe-chart-legend--${position}`">
    <span v-for="(item, i) in items" :key="item.label ?? i" class="vibe-chart-legend-item">
      <span class="vibe-chart-legend-swatch" :style="{ background: item.color }" />
      {{ item.label }}
    </span>
  </div>
</template>

<style scoped>
.vibe-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.vibe-chart-legend--top { margin-bottom: 0.25rem; }
.vibe-chart-legend--bottom { margin-top: 0.25rem; }
.vibe-chart-legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.vibe-chart-legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
