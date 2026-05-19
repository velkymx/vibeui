import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeChartLine from '../../src/components/VibeChartLine.vue'
import { mockCanvas, mockResizeObserver, mockAnimationFrame } from '../mocks/canvasMock'
import type { ChartData } from '../../src/types'

const DATA: ChartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    { label: 'Revenue', data: [10, 20, 15] },
    { label: 'Costs', data: [5, 8, 12] },
  ],
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

describe('VibeChartLine', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA } })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders legend at bottom by default', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA } })
    expect(wrapper.find('.vibe-chart-legend--bottom').exists()).toBe(true)
    expect(wrapper.find('.vibe-chart-legend--top').exists()).toBe(false)
  })

  it('renders legend at top when legend="top"', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA, legend: 'top' } })
    expect(wrapper.find('.vibe-chart-legend--top').exists()).toBe(true)
    expect(wrapper.find('.vibe-chart-legend--bottom').exists()).toBe(false)
  })

  it('hides legend when legend="none"', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA, legend: 'none' } })
    expect(wrapper.find('.vibe-chart-legend').exists()).toBe(false)
  })

  it('shows all dataset labels in legend', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA } })
    const items = wrapper.findAll('.vibe-chart-legend-item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Revenue')
    expect(items[1].text()).toContain('Costs')
  })

  it('canvas container uses aspect-ratio style by default', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA } })
    const container = wrapper.find('.vibe-chart-canvas-container')
    expect(container.attributes('style')).toContain('aspect-ratio')
  })

  it('canvas container uses explicit height when height prop given', () => {
    const wrapper = mount(VibeChartLine, { props: { data: DATA, height: 300 } })
    const container = wrapper.find('.vibe-chart-canvas-container')
    expect(container.attributes('style')).toContain('300px')
  })

  it('calls clearRect when ResizeObserver triggers', () => {
    const ctx = mockCanvas()
    const ro = mockResizeObserver()
    mount(VibeChartLine, { props: { data: DATA } })
    ro.trigger(400, 225)
    expect(ctx.clearRect).toHaveBeenCalled()
  })
})
