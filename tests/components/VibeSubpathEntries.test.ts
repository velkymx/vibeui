import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { defineAsyncComponent, nextTick } from 'vue'
import { mockCanvas, mockResizeObserver, mockAnimationFrame } from '../mocks/canvasMock'

// #180: heavy components ship individually addressable sub-path entries with a
// package exports contract, so lazy loaders download just the component.
const SUBPATHS = ['chart-line', 'chart-bar', 'chart-pie', 'wysiwyg'] as const

describe('sub-path entries (#180)', () => {
  it('package.json maps every sub-path with types plus ESM import', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      exports: Record<string, Record<string, string>>
    }
    for (const name of SUBPATHS) {
      const entry = pkg.exports[`./${name}`]
      expect(entry, name).toBeDefined()
      expect(entry.types.endsWith('.d.ts')).toBe(true)
      expect(entry.import.endsWith('.es.js')).toBe(true)
    }
  })

  it('each entry module exposes its component and renders', async () => {
    mockCanvas()
    mockResizeObserver()
    mockAnimationFrame()
    const modules = {
      'chart-line': await import('../../src/chart-line'),
      'chart-bar': await import('../../src/chart-bar'),
      'chart-pie': await import('../../src/chart-pie'),
      wysiwyg: await import('../../src/wysiwyg'),
    }
    expect(modules['chart-line'].VibeChartLine).toBeDefined()
    expect(modules['chart-bar'].VibeChartBar).toBeDefined()
    expect(modules['chart-pie'].VibeChartPie).toBeDefined()
    expect(modules.wysiwyg.VibeFormWysiwyg).toBeDefined()

    const LazyChartLine = defineAsyncComponent(() => import('../../src/chart-line').then((m) => m.default))
    const wrapper = mount({
      components: { LazyChartLine },
      template: '<LazyChartLine :data="d" />',
      data: () => ({ d: { labels: ['Jan'], datasets: [{ label: 'R', data: [3] }] } }),
    })
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
