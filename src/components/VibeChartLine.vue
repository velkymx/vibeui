<script setup lang="ts">
import VibeChartLegend from './chart/VibeChartLegend.vue'
import { ref, computed, watch, onMounted, onUnmounted, type PropType } from 'vue'
import type { ChartData, ChartLegendPosition } from '../types'
import { resolveColors } from './chart/chartColors'
import { useChartResize } from './chart/chartResize'
import { bindTooltip } from './chart/chartTooltip'
import { drawLine, hitTestLine, getLineExtent } from './chart/drawLine'

const props = defineProps({
  data: { type: Object as PropType<ChartData>, required: true },
  legend: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
  height: { type: [Number, String] as PropType<number | string>, default: 'auto' },
  showAxes: { type: Boolean, default: true },
  showGrid: { type: Boolean, default: true },
  smooth: { type: Boolean, default: false },
  fill: { type: Boolean, default: false },
})

const containerEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let cleanupTooltip: (() => void) | null = null
let currentW = 0
let currentH = 0

const canvasContainerStyle = computed(() => {
  if (props.height === 'auto') return { width: '100%', aspectRatio: '16/9' }
  const h = typeof props.height === 'number' ? `${props.height}px` : (props.height as string)
  return { width: '100%', height: h }
})

// Plain ref, not a computed: resolveColors() calls getComputedStyle() — a synchronous
// forced layout read. Inside a computed it would re-run (and thrash layout) on every
// reactive dependency change. Instead we refresh it explicitly inside redraw(), which
// runs in the ResizeObserver RAF callback, so the DOM read happens at a safe time.
// It stays a ref (not a local) so the reactive legend swatches update when it changes.
const resolvedColors = ref<string[]>([])

function updateColors() {
  resolvedColors.value = containerEl.value
    ? resolveColors(props.data.datasets, containerEl.value)
    : []
}

// Precomputed value extent for hit-testing, refreshed on each redraw (data / layout /
// resize) so the tooltip path never re-scans all values per mousemove.
let hitExtent: { min: number; max: number; range: number } | null = null

function redraw() {
  // Refresh colors before the dimension guard so the legend populates even if the
  // canvas has not been sized yet.
  updateColors()
  hitExtent = getLineExtent(props.data)
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
  drawLine(
    ctx,
    props.data,
    currentW,
    currentH,
    resolvedColors.value,
    props.showAxes,
    props.showGrid,
    props.smooth,
    props.fill
  )
}

useChartResize(containerEl, (w, h) => {
  currentW = w
  currentH = h
  redraw()
})

onMounted(() => {
  // One-time color resolution at mount so the legend has colors before the first
  // ResizeObserver callback. Subsequent refreshes happen inside redraw().
  updateColors()
  hitExtent = getLineExtent(props.data)
  if (containerEl.value && canvasEl.value) {
    cleanupTooltip = bindTooltip(
      containerEl.value,
      canvasEl.value,
      (x, y) => hitTestLine(x, y, props.data, currentW, currentH, props.showAxes, hitExtent)
    )
  }
})

// Shallow watch: only fires when the `data` reference itself is replaced.
// Nested mutations (e.g. datasets[0].data.push()) will NOT trigger a repaint;
// consumers must use immutable updates: data = { ...data, datasets: [...] }.
// This prevents N canvas repaints for N synchronous array mutations (CR9-7).
watch(() => props.data, redraw)
watch([() => props.showAxes, () => props.showGrid, () => props.smooth, () => props.fill], redraw)

onUnmounted(() => {
  cleanupTooltip?.()
})

const legendItems = computed(() =>
  props.data.datasets.map((ds, i) => ({ label: ds.label, color: resolvedColors.value[i] }))
)
</script>

<template>
  <div class="vibe-chart">
    <VibeChartLegend v-if="legend === 'top'" position="top" :items="legendItems" />
    <div ref="containerEl" class="vibe-chart-canvas-container" :style="canvasContainerStyle">
      <canvas ref="canvasEl" role="img" aria-label="Chart" style="display: block; width: 100%; height: 100%;" />
    </div>
    <VibeChartLegend v-if="legend === 'bottom'" position="bottom" :items="legendItems" />
  </div>
</template>

<style scoped>
.vibe-chart {
  width: 100%;
}
</style>
