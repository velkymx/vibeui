import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeChartLegend from '../../../src/components/chart/VibeChartLegend.vue'

// #193: item.color can originate from dataset data, so it is untrusted.
// url()/expression() payloads must be dropped, the swatch must bind the
// background-color longhand (never the background shorthand), and valid
// colors still render.
describe('VibeChartLegend swatch sanitizing (#193)', () => {
  const mountLegend = (colors: string[]) =>
    mount(VibeChartLegend, {
      props: {
        position: 'bottom',
        items: colors.map((color, i) => ({ label: `set-${i}`, color }))
      }
    })

  it('drops url() and expression() colors from swatches', () => {
    const wrapper = mountLegend(['url(https://evil/x)', 'expression(alert(1))'])
    const swatches = wrapper.findAll('.vibe-chart-legend-swatch')
    expect(swatches).toHaveLength(2)
    for (const swatch of swatches) {
      const style = swatch.attributes('style') ?? ''
      expect(style).not.toContain('url(')
      expect(style).not.toContain('expression')
    }
  })

  it('binds valid colors via the background-color longhand', () => {
    const wrapper = mountLegend(['#ff0000', 'red'])
    const swatches = wrapper.findAll('.vibe-chart-legend-swatch')
    expect(swatches).toHaveLength(2)
    for (const swatch of swatches) {
      const el = swatch.element as HTMLElement
      expect(el.style.backgroundColor).not.toBe('')
      expect(el.style.backgroundImage).toBe('')
    }
  })

  it('uses unique keys for same-label items', () => {
    const wrapper = mount(VibeChartLegend, {
      props: {
        position: 'bottom',
        items: [
          { label: 'same', color: '#ff0000' },
          { label: 'same', color: '#00ff00' }
        ]
      }
    })
    expect(wrapper.findAll('.vibe-chart-legend-item')).toHaveLength(2)
  })
})
