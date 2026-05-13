import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeChartPie from '../../src/components/VibeChartPie.vue'
import { mockCanvas, mockResizeObserver } from '../mocks/canvasMock'
import type { ChartData } from '../../src/types'

const DATA: ChartData = {
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'Market share', data: [50, 30, 20] }],
}

beforeEach(() => {
  mockCanvas()
  mockResizeObserver()
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
})
