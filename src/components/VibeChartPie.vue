<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type PropType } from 'vue'
import type { ChartData, ChartLegendPosition } from '../types'
import { resolveSliceColors } from './chart/chartColors'
import { useChartResize } from './chart/chartResize'
import { bindTooltip } from './chart/chartTooltip'
import { drawPie, hitTestPie } from './chart/drawPie'

const props = defineProps({
  data: { type: Object as PropType<ChartData>, required: true },
  legend: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
  height: { type: [Number, String] as PropType<number | string>, default: 'auto' },
})

const containerEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let cleanupTooltip: (() => void) | null = null
let currentW = 0
let currentH = 0

const canvasContainerStyle = computed(() => {
  if (props.height === 'auto') return { width: '100%', aspectRatio: '1/1' }
  const h = typeof props.height === 'number' ? `${props.height}px` : (props.height as string)
  return { width: '100%', height: h }
})

const resolvedColors = computed(() =>
  containerEl.value ? resolveSliceColors(props.data.labels?.length ?? 0, containerEl.value) : []
)

function redraw() {
  if (!canvasEl.value || !currentW || !currentH) return
  const canvas = canvasEl.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const pw = Math.round(currentW * dpr)
  const ph = Math.round(currentH * dpr)
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw
    canvas.height = ph
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  drawPie(ctx, props.data, currentW, currentH, resolvedColors.value)
}

useChartResize(containerEl, canvasEl, (w, h) => {
  currentW = w
  currentH = h
  redraw()
})

onMounted(() => {
  if (canvasEl.value) {
    cleanupTooltip = bindTooltip(
      canvasEl.value,
      (x, y) => hitTestPie(x, y, props.data, currentW, currentH),
      redraw
    )
  }
})

watch(() => props.data, redraw, { deep: true })

onUnmounted(() => {
  cleanupTooltip?.()
})
</script>

<template>
  <div class="vibe-chart">
    <div v-if="legend === 'top'" class="vibe-chart-legend vibe-chart-legend--top">
      <span v-for="(label, i) in data.labels" :key="i" class="vibe-chart-legend-item">
        <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }" />
        {{ label }}
      </span>
    </div>
    <div ref="containerEl" class="vibe-chart-canvas-container" :style="canvasContainerStyle">
      <canvas ref="canvasEl" style="display: block; width: 100%; height: 100%;" />
    </div>
    <div v-if="legend === 'bottom'" class="vibe-chart-legend vibe-chart-legend--bottom">
      <span v-for="(label, i) in data.labels" :key="i" class="vibe-chart-legend-item">
        <span class="vibe-chart-legend-swatch" :style="{ background: resolvedColors[i] }" />
        {{ label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.vibe-chart { width: 100%; }
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
