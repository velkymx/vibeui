import { type Ref, onMounted, onUnmounted } from 'vue'

export function useChartResize(
  container: Ref<HTMLElement | null>,
  canvas: Ref<HTMLCanvasElement | null>,
  onResize: (w: number, h: number) => void
): void {
  let observer: ResizeObserver | null = null
  let rafId: number | null = null

  onMounted(() => {
    let pendingEntry: ResizeObserverEntry | null = null
    observer = new ResizeObserver((entries) => {
      pendingEntry = entries[0] ?? null
      if (!pendingEntry || rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        if (!pendingEntry) return
        const { width, height } = pendingEntry.contentRect
        pendingEntry = null
        onResize(width, height)
      })
    })
    if (container.value) observer.observe(container.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    if (rafId !== null) cancelAnimationFrame(rafId)
  })
}
