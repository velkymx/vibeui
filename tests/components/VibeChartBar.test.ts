import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeChartBar from '../../src/components/VibeChartBar.vue'
import { mockCanvas, mockResizeObserver, mockAnimationFrame } from '../mocks/canvasMock'
import type { ChartData } from '../../src/types'

const DATA: ChartData = {
  labels: ['Q1', 'Q2', 'Q3'],
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

describe('VibeChartBar', () => {
  it('renders a canvas element', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA } })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('renders legend at bottom by default', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA } })
    expect(wrapper.find('.vibe-chart-legend--bottom').exists()).toBe(true)
  })

  it('renders legend at top when legend="top"', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA, legend: 'top' } })
    expect(wrapper.find('.vibe-chart-legend--top').exists()).toBe(true)
  })

  it('hides legend when legend="none"', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA, legend: 'none' } })
    expect(wrapper.find('.vibe-chart-legend').exists()).toBe(false)
  })

  it('shows dataset labels in legend', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA } })
    const items = wrapper.findAll('.vibe-chart-legend-item')
    expect(items[0].text()).toContain('Revenue')
    expect(items[1].text()).toContain('Costs')
  })

  it('calls clearRect when ResizeObserver triggers', () => {
    const ctx = mockCanvas()
    const ro = mockResizeObserver()
    mount(VibeChartBar, { props: { data: DATA } })
    ro.trigger(400, 225)
    expect(ctx.clearRect).toHaveBeenCalled()
  })

  it('applies explicit height when given', () => {
    const wrapper = mount(VibeChartBar, { props: { data: DATA, height: 400 } })
    expect(wrapper.find('.vibe-chart-canvas-container').attributes('style')).toContain('400px')
  })
})
