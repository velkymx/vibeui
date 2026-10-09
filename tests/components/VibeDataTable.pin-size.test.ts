import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 3b: pinning (sticky start/end columns with engine offsets) and
// resizing (header handle: pointer drag plus arrow-key stepping). Opt-in only.
describe('VibeDataTable pinning and resizing (#283)', () => {
  const items = [
    { id: 1, name: 'Alice', email: 'a@x.com' },
    { id: 2, name: 'Bob', email: 'b@x.com' }
  ]
  const base = { paginated: false, items }

  it('pins start columns sticky with cumulative left offsets', () => {
    const columns = [
      { key: 'id', label: 'ID', pinned: 'start' as const, width: 120 },
      { key: 'name', label: 'Name', pinned: 'start' as const, width: 80 },
      { key: 'email', label: 'Email' }
    ]
    const wrapper = mount(VibeDataTable, { props: { ...base, columns } })
    const headers = wrapper.findAll('thead th')
    expect(headers[0].classes()).toContain('vibe-pinned-start')
    expect(headers[1].classes()).toContain('vibe-pinned-start')
    expect(headers[2].classes()).not.toContain('vibe-pinned-start')
    expect((headers[0].element as HTMLElement).style.left).toBe('0px')
    expect((headers[1].element as HTMLElement).style.left).toBe('120px')
    const firstRowCells = wrapper.findAll('tbody tr')[0].findAll('td')
    expect(firstRowCells[0].classes()).toContain('vibe-pinned-start')
    expect((firstRowCells[1].element as HTMLElement).style.left).toBe('120px')
    wrapper.unmount()
  })

  it('pins end columns sticky with a right offset', () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'email', label: 'Email', pinned: 'end' as const }
    ]
    const wrapper = mount(VibeDataTable, { props: { ...base, columns } })
    const headers = wrapper.findAll('thead th')
    expect(headers[1].classes()).toContain('vibe-pinned-end')
    expect((headers[1].element as HTMLElement).style.right).toBe('0px')
    wrapper.unmount()
  })

  it('renders no resize handle unless the column is resizable', () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name', resizable: true }
    ]
    const wrapper = mount(VibeDataTable, { props: { ...base, columns } })
    const headers = wrapper.findAll('thead th')
    expect(headers[0].find('.vibe-resize-handle').exists()).toBe(false)
    expect(headers[1].find('.vibe-resize-handle').exists()).toBe(true)
    wrapper.unmount()
  })

  it('arrow keys on the resize handle step the width and emit update:columnSizing', async () => {
    const columns = [{ key: 'name', label: 'Name', resizable: true, width: 120 }]
    const wrapper = mount(VibeDataTable, {
      props: { ...base, columns, columnSizing: {} }
    })
    const handle = wrapper.find('.vibe-resize-handle')
    await handle.trigger('keydown', { key: 'ArrowRight' })
    const emitted = wrapper.emitted('update:columnSizing')
    expect(emitted).toBeTruthy()
    const last = emitted![emitted!.length - 1][0] as Record<string, number>
    expect(last.name).toBeGreaterThan(120)
    expect((wrapper.find('thead th').element as HTMLElement).style.width).toBe(`${last.name}px`)
    wrapper.unmount()
  })

  it('renders no sticky classes by default', () => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' }
    ]
    const wrapper = mount(VibeDataTable, { props: { ...base, columns } })
    expect(wrapper.find('.vibe-pinned-start').exists()).toBe(false)
    expect(wrapper.find('.vibe-pinned-end').exists()).toBe(false)
    wrapper.unmount()
  })
})
