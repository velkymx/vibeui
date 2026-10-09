import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import VibeChartPie from '../../src/components/VibeChartPie.vue'
import { mockCanvas, mockResizeObserver, mockAnimationFrame } from '../mocks/canvasMock'
import type { ChartData } from '../../src/types'

const DATA: ChartData = {
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'Market share', data: [50, 30, 20] }],
}

beforeEach(() => {
  mockCanvas()
  mockResizeObserver()
  mockAnimationFrame()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('VibeChartPie', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA } })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders legend at bottom by default', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA } })
    expect(wrapper.find('.vibe-chart-legend--bottom').exists()).toBe(true)
  })

  it('renders legend at top when legend="top"', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA, legend: 'top' } })
    expect(wrapper.find('.vibe-chart-legend--top').exists()).toBe(true)
  })

  it('hides legend when legend="none"', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA, legend: 'none' } })
    expect(wrapper.find('.vibe-chart-legend').exists()).toBe(false)
  })

  it('shows slice labels in legend (not dataset labels)', () => {
    const wrapper = mount(VibeChartPie, { props: { data: DATA } })
    const items = wrapper.findAll('.vibe-chart-legend-item')
    // Legend items = labels (A, B, C), not dataset label (Market share)
    expect(items).toHaveLength(3)
    expect(items[0].text()).toContain('A')
    expect(items[1].text()).toContain('B')
    expect(items[2].text()).toContain('C')
  })

  it('calls clearRect when ResizeObserver triggers', () => {
    const ctx = mockCanvas()
    const ro = mockResizeObserver()
    mount(VibeChartPie, { props: { data: DATA } })
    ro.trigger(400, 400)
    expect(ctx.clearRect).toHaveBeenCalled()
  })

  it('does not render axes or grid props', () => {
    // VibeChartPie has no showAxes/showGrid props — verify component mounts without them
    const wrapper = mount(VibeChartPie, { props: { data: DATA } })
    expect(wrapper.exists()).toBe(true)
  })

  // CR9-7: { deep: true } caused a full canvas repaint on EVERY nested mutation.
  // Fix: shallow watch — only a new data reference triggers redraw.
  it('does NOT repaint when datasets[0].data is mutated in place (CR9-7)', async () => {
    const ctx = mockCanvas()
    const ro = mockResizeObserver()
    const data = reactive<ChartData>({
      labels: ['A', 'B'],
      datasets: [{ label: 'S', data: [50, 50] }],
    })
    mount(VibeChartPie, { props: { data } })
    ro.trigger(400, 400)
    ctx.clearRect.mockClear()

    data.datasets[0].data.push(25)
    await nextTick()

    expect(ctx.clearRect).not.toHaveBeenCalled()
  })

  it('repaints once when the data reference is replaced with a new object (CR9-7)', async () => {
    const ctx = mockCanvas()
    const ro = mockResizeObserver()
    const data: ChartData = {
      labels: ['A', 'B'],
      datasets: [{ label: 'S', data: [50, 50] }],
    }
    const wrapper = mount(VibeChartPie, { props: { data } })
    ro.trigger(400, 400)
    ctx.clearRect.mockClear()

    await wrapper.setProps({
      data: { labels: ['A', 'B', 'C'], datasets: [{ label: 'S', data: [40, 30, 30] }] }
    })

    expect(ctx.clearRect).toHaveBeenCalledTimes(1)
  })

  // #193: freeform height is untrusted. expression()/url() payloads fall back
  // to the aspect-ratio default instead of reaching :style.
  it('#193 drops expression() and url() heights, keeps valid ones', () => {
    for (const payload of ['expression(alert(1))', 'url(https://evil/x)']) {
      const wrapper = mount(VibeChartPie, { props: { data: DATA, height: payload } })
      const style = wrapper.find('.vibe-chart-canvas-container').attributes('style') ?? ''
      expect(style).not.toContain('expression')
      expect(style).not.toContain('url(')
      expect(style).toContain('aspect-ratio')
    }
    const ok = mount(VibeChartPie, { props: { data: DATA, height: 400 } })
    expect(ok.find('.vibe-chart-canvas-container').attributes('style')).toContain('400px')
  })

  // #226: shape-incomplete data (async load in flight) renders the empty
  // chart instead of throwing inside render.
  it('#226 renders without throwing on shape-incomplete data', () => {
    expect(() =>
      mount(VibeChartPie, { props: { data: { datasets: [] } as never } })
    ).not.toThrow()
  })
})
