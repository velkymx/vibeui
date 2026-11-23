import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 5: virtualization (windowed rendering behind the virtualized
// prop). Opt-in; default rendering unchanged.
describe('VibeDataTable virtualization (#283)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ]
  const items = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }))
  const base = { columns, items, paginated: false }

  it('renders every row when not virtualized', () => {
    const wrapper = mount(VibeDataTable, { props: { ...base } })
    expect(wrapper.find('.vibe-virtual-spacer').exists()).toBe(false)
    expect(wrapper.findAll('tbody tr').length).toBe(50)
    wrapper.unmount()
  })

  it('windows rows with spacer padding that sums to the full height', () => {
    const wrapper = mount(VibeDataTable, {
      props: { ...base, virtualized: true, virtualEstimateSize: 48 }
    })
    const dataRows = wrapper.findAll('tbody tr:not(.vibe-virtual-spacer)')
    expect(dataRows.length).toBeGreaterThan(0)
    expect(dataRows.length).toBeLessThan(50)
    const spacers = wrapper.findAll('.vibe-virtual-spacer')
    expect(spacers.length).toBe(2)
    const px = (row: { find: (s: string) => { element: unknown } }): number => {
      const el = row.find('td').element as HTMLElement
      return Number.parseFloat(el.style.height.replace('px', '')) || 0
    }
    const spacerTotal = spacers.reduce((sum, s) => sum + px(s), 0)
    // Spacer padding plus rendered estimates equals the full 50-row height.
    expect(spacerTotal + dataRows.length * 48).toBe(50 * 48)
    // First window starts at the top.
    expect(wrapper.text()).toContain('Row 1')
    wrapper.unmount()
  })

  it('honors a custom estimate size', () => {
    const ten = items.slice(0, 10)
    const wrapper = mount(VibeDataTable, {
      props: { columns, items: ten, paginated: false, virtualized: true, virtualEstimateSize: 100 }
    })
    const spacers = wrapper.findAll('.vibe-virtual-spacer')
    const cellPx = (row: { find: (s: string) => { element: unknown } }): number => {
      const el = row.find('td').element as HTMLElement
      return Number.parseFloat(el.style.height.replace('px', '')) || 0
    }
    const dataRows = wrapper.findAll('tbody tr:not(.vibe-virtual-spacer)')
    expect(spacers.reduce((sum, s) => sum + cellPx(s), 0) + dataRows.length * 100).toBe(1000)
    wrapper.unmount()
  })

  it('attaches no virtualizer observers while virtualization is off', async () => {
    const constructed = vi.fn()
    class SpyResizeObserver {
      constructor() {
        constructed()
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    vi.stubGlobal('ResizeObserver', SpyResizeObserver)
    const off = mount(VibeDataTable, { props: { ...base } })
    // Force an options update now that the scroll element exists: without the
    // `enabled` gate this is where the observer would attach.
    await off.setProps({ items: items.slice(0, 40) })
    expect(constructed).not.toHaveBeenCalled()
    off.unmount()

    // Sanity: the spy is wired to the element window the virtualizer uses.
    const on = mount(VibeDataTable, { props: { ...base, virtualized: true } })
    await on.setProps({ items: items.slice(0, 40) })
    expect(constructed).toHaveBeenCalled()
    on.unmount()
  })

  it('formats only the rendered window while virtualized', () => {
    const formatter = vi.fn((value: unknown) => String(value))
    const cols = [{ key: 'name', label: 'Name', formatter }]
    const wrapper = mount(VibeDataTable, {
      props: { columns: cols, items, paginated: false, virtualized: true, virtualEstimateSize: 48 }
    })
    expect(formatter).toHaveBeenCalled()
    // The window is a fraction of the 50-row dataset; formatting the whole
    // dataset here is the bug the rendered-entry map removes.
    expect(formatter.mock.calls.length).toBeLessThan(items.length)
    expect(wrapper.text()).toContain('Row 1')
    wrapper.unmount()
  })

  it('bypasses pagination while virtualized', () => {
    const wrapper = mount(VibeDataTable, {
      props: { ...base, paginated: true, perPage: 10, virtualized: true }
    })
    // Pagination controls hide: one windowing source, not two.
    expect(wrapper.find('.pagination').exists()).toBe(false)
    // The window comes from the full 50, not the 10-row page.
    const dataRows = wrapper.findAll('tbody tr:not(.vibe-virtual-spacer)')
    expect(dataRows.length).toBeGreaterThan(0)
    expect(wrapper.find('.vibe-virtual-spacer').exists()).toBe(true)
    wrapper.unmount()
  })
})
