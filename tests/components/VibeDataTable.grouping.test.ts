import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 4b: grouping (group header rows, expand/collapse, aggregation)
// plus footer row. Opt-in via groupBy; default rendering unchanged.
describe('VibeDataTable grouping and footer (#283)', () => {
  const columns = [
    { key: 'dept', label: 'Dept' },
    { key: 'name', label: 'Name' },
    { key: 'salary', label: 'Salary', aggregate: 'sum' as const }
  ]
  const items = [
    { id: 1, dept: 'Eng', name: 'Alice', salary: 100 },
    { id: 2, dept: 'Eng', name: 'Bob', salary: 200 },
    { id: 3, dept: 'Ops', name: 'Cara', salary: 300 }
  ]
  const base = { columns, items, paginated: false }

  it('renders no group rows or footer by default', () => {
    const wrapper = mount(VibeDataTable, { props: { ...base } })
    expect(wrapper.find('.vibe-group-row').exists()).toBe(false)
    expect(wrapper.find('tfoot').exists()).toBe(false)
    // All rows visible ungrouped.
    expect(wrapper.findAll('tbody tr').length).toBe(3)
    wrapper.unmount()
  })

  it('groups rows under headers with leaf counts, collapsed by default', () => {
    const wrapper = mount(VibeDataTable, { props: { ...base, groupBy: 'dept' } })
    const groups = wrapper.findAll('.vibe-group-row')
    expect(groups).toHaveLength(2)
    expect(groups[0].text()).toContain('Eng')
    expect(groups[0].text()).toContain('2')
    // Leaf rows hidden until their group expands.
    expect(wrapper.text()).not.toContain('Alice')
    wrapper.unmount()
  })

  it('expanding a group reveals its leaf rows', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { ...base, groupBy: 'dept', expandedRows: [] }
    })
    await wrapper.find('.vibe-group-row .vibe-expand-toggle').trigger('click')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).not.toContain('Cara')
    const emitted = wrapper.emitted('update:expandedRows')
    expect(emitted).toBeTruthy()
    wrapper.unmount()
  })

  it('shows aggregated values in the group row', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { ...base, groupBy: 'dept', expandedRows: [] }
    })
    const groups = wrapper.findAll('.vibe-group-row')
    // Eng salaries 100 + 200 aggregate to 300 in the salary cell.
    expect(groups[0].text()).toContain('300')
    wrapper.unmount()
  })

  it('renders a footer row from column footer text', () => {
    const cols = [
      { key: 'dept', label: 'Dept' },
      { key: 'name', label: 'Name', footer: 'Total' }
    ]
    const wrapper = mount(VibeDataTable, { props: { columns: cols, items, paginated: false } })
    const foot = wrapper.find('tfoot')
    expect(foot.exists()).toBe(true)
    expect(foot.text()).toContain('Total')
    wrapper.unmount()
  })
})
