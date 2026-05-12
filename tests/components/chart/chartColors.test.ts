import { describe, it, expect, vi, afterEach } from 'vitest'
import { resolveColors, resolveSliceColors } from '../../../src/components/chart/chartColors'
import type { ChartDataset } from '../../../src/types'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('resolveColors', () => {
  it('uses dataset color when provided', () => {
    const el = document.createElement('div')
    const datasets: ChartDataset[] = [{ label: 'A', data: [1], color: '#ff0000' }]
    expect(resolveColors(datasets, el)[0]).toBe('#ff0000')
  })

  it('reads trimmed BS var when no color provided', () => {
    const el = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (p: string) => (p === '--bs-primary' ? ' #0d6efd ' : ''),
    } as unknown as CSSStyleDeclaration)
    const datasets: ChartDataset[] = [{ label: 'A', data: [1] }]
    expect(resolveColors(datasets, el)[0]).toBe('#0d6efd')
  })

  it('cycles vars for 9+ datasets', () => {
    const el = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (p: string) => p,
    } as unknown as CSSStyleDeclaration)
    const datasets: ChartDataset[] = Array.from({ length: 9 }, (_, i) => ({
      label: String(i),
      data: [i],
    }))
    const colors = resolveColors(datasets, el)
    expect(colors[8]).toBe(colors[0])
  })

  it('mixes explicit and auto colors', () => {
    const el = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => 'auto',
    } as unknown as CSSStyleDeclaration)
    const datasets: ChartDataset[] = [
      { label: 'A', data: [1], color: 'red' },
      { label: 'B', data: [2] },
    ]
    const colors = resolveColors(datasets, el)
    expect(colors[0]).toBe('red')
    expect(colors[1]).toBe('auto')
  })
})

describe('resolveSliceColors', () => {
  it('returns n colors cycling BS vars', () => {
    const el = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (p: string) => p,
    } as unknown as CSSStyleDeclaration)
    const colors = resolveSliceColors(3, el)
    expect(colors).toHaveLength(3)
    expect(colors[0]).not.toBe(colors[1])
  })
})
