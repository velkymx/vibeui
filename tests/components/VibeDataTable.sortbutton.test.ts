import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 0 a11y baseline (prescribed, missing until now): the sort control
// is a keyboard-operable button inside the th, not a clickable th.
describe('VibeDataTable sort button (#283)', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ]
  const items = [
    { id: 2, name: 'Bob' },
    { id: 1, name: 'Alice' }
  ]
  const base = { columns, items, paginated: false }

  it('renders a sort button inside sortable headers', () => {
    const wrapper = mount(VibeDataTable, { props: { ...base } })
    const buttons = wrapper.findAll('thead th .vibe-sort-button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].attributes('aria-label')).toContain('ID')
    wrapper.unmount()
  })

  it('renders no sort button when sorting is off', () => {
    const wrapper = mount(VibeDataTable, { props: { ...base, sortable: false } })
    expect(wrapper.find('.vibe-sort-button').exists()).toBe(false)
    wrapper.unmount()
  })

  it('activates sort from the keyboard and announces via aria-sort', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { ...base, sortBy: undefined, sortDesc: false }
    })
    const button = wrapper.findAll('thead th .vibe-sort-button')[0]
    // Native button: focusable and Enter/Space-operable without extra code.
    expect(button.element.tagName).toBe('BUTTON')
    await button.trigger('click')
    const emitted = wrapper.emitted('update:sortBy')
    expect(emitted).toBeTruthy()
    expect(emitted![emitted!.length - 1][0]).toBe('id')
    // First data row is now the smallest id; th announces ascending.
    expect(wrapper.findAll('tbody tr')[0].text()).toContain('1')
    expect(wrapper.findAll('thead th')[0].attributes('aria-sort')).toBe('ascending')
    wrapper.unmount()
  })
})
