import { type Ref, onMounted, onUnmounted } from 'vue'

export function useChartResize(
  container: Ref<HTMLElement | null>,
  canvas: Ref<HTMLCanvasElement | null>,
  onResize: (w: number, h: number) => void
): void {
  let observer: ResizeObserver | null = null

  onMounted(() => {
    observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      onResize(width, height)
    })
    if (container.value) observer.observe(container.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
