import { vi } from 'vitest'

export function createMockCtx() {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    roundRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: '' as string,
    fillStyle: '' as string,
    lineWidth: 1,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
  }
}

export function mockCanvas(overrides = createMockCtx()) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    overrides as unknown as CanvasRenderingContext2D
  )
  return overrides
}

export function mockResizeObserver() {
  let callback: ResizeObserverCallback | null = null
  const observe = vi.fn()
  const disconnect = vi.fn()

  class MockResizeObserver {
    constructor(cb: ResizeObserverCallback) {
      callback = cb
    }
    observe = observe
    disconnect = disconnect
  }

  vi.stubGlobal('ResizeObserver', MockResizeObserver)

  return {
    observe,
    disconnect,
    trigger: (w: number, h: number) =>
      callback?.(
        [{ contentRect: { width: w, height: h } } as ResizeObserverEntry],
        {} as ResizeObserver
      ),
  }
}
