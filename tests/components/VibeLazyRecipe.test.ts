import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineAsyncComponent, nextTick } from 'vue'
import { mockCanvas, mockResizeObserver, mockAnimationFrame } from '../mocks/canvasMock'

// #152: the lazy-hydration recipe pins to real package exports: an async
// wrapper around the dynamically imported chart mounts and renders.
describe('lazy hydration recipe (#152)', () => {
  beforeEach(() => {
    mockCanvas()
    mockResizeObserver()
    mockAnimationFrame()
  })

  it('exposes the heavy components as individually addressable named exports', async () => {
    const lib = await import('../../src/index')
    for (const name of ['VibeChartLine', 'VibeChartBar', 'VibeChartPie', 'VibeFormWysiwyg'] as const) {
      expect(lib[name], name).toBeDefined()
    }
  })

  it('an async wrapper around the chart loader mounts and renders', async () => {
    const LazyChartLine = defineAsyncComponent(() => import('../../src/chart-line').then((m) => m.default))
    const wrapper = mount({
      components: { LazyChartLine },
      template: '<LazyChartLine :data="d" />',
      data: () => ({ d: { labels: ['Jan'], datasets: [{ label: 'R', data: [3] }] } }),
    })
    // The first dynamic import of the library takes a while to transform;
    // poll until the async wrapper resolves.
    let ready = false
    for (let i = 0; i < 40 && !ready; i++) {
      await new Promise((r) => setTimeout(r, 250))
      await nextTick()
      try {
        ready = wrapper.find('canvas').exists()
      } catch {
        ready = false
      }
    }
    expect(ready).toBe(true)
  }, 20000)
})
