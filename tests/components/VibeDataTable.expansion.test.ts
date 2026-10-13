import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 4a: row expansion (toggle column, expanded slot, sub-rows).
// Opt-in via expandable; default rendering unchanged.
describe('VibeDataTable row expansion (#283)', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ]
  const items = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]
  const base = { columns, items, paginated: false }

  it('renders no toggle column by default', () => {
    const wrapper = mount(VibeDataTable, { props: { ...base } })
    expect(wrapper.find('.vibe-expand-toggle').exists()).toBe(false)
    wrapper.unmount()
  })

  it('toggles an expanded slot row and emits update:expandedRows', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { ...base, expandable: true, expandedRows: [] },
      slots: {
        expanded: (scope: { item: { name: string } }) =>
          h('div', { class: 'detail' }, `Detail for ${scope.item.name}`)
      }
    })
    const toggle = wrapper.find('.vibe-expand-toggle')
    expect(toggle.exists()).toBe(true)
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.detail').exists()).toBe(false)
    await toggle.trigger('click')
    expect(wrapper.find('.detail').exists()).toBe(true)
    expect(wrapper.find('.detail').text()).toContain('Alice')
    expect(wrapper.find('.vibe-expand-toggle').attributes('aria-expanded')).toBe('true')
    const emitted = wrapper.emitted('update:expandedRows')
    expect(emitted).toBeTruthy()
    expect(emitted![emitted!.length - 1][0]).toEqual(['1'])
    wrapper.unmount()
  })

  it('renders sub-rows when the parent expands', async () => {
    const nested = [
      { id: 1, name: 'Alice', children: [{ id: 11, name: 'A-Junior' }] },
      { id: 2, name: 'Bob' }
    ]
    const wrapper = mount(VibeDataTable, {
      props: { ...base, items: nested, expandable: true, expandedRows: [] }
    })
    expect(wrapper.text()).not.toContain('A-Junior')
    await wrapper.find('.vibe-expand-toggle').trigger('click')
    expect(wrapper.text()).toContain('A-Junior')
    wrapper.unmount()
  })

  it('omits the toggle for rows that cannot expand when expandable is selective', async () => {
    const wrapper = mount(VibeDataTable, {
      props: {
        ...base,
        expandable: true,
        expandableRow: (item: { id: number }) => item.id === 2,
        expandedRows: []
      }
    })
    const toggles = wrapper.findAll('.vibe-expand-toggle')
    expect(toggles).toHaveLength(1)
    await toggles[0].trigger('click')
    expect(wrapper.emitted('update:expandedRows')![0][0]).toEqual(['2'])
    wrapper.unmount()
  })
})
