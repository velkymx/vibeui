import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 2b: per-column filters. Opt-in via column.filter ('text' |
// 'select' | 'range'); a filter row renders only when a column opts in, so
// default DOM is unchanged. Global search is independent.
describe('VibeDataTable column filters (#283)', () => {
  const plainColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ]
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', filter: 'text' as const },
    { key: 'status', label: 'Status', filter: 'select' as const },
    { key: 'age', label: 'Age', filter: 'range' as const }
  ]
  const items = [
    { id: 1, name: 'Alice', status: 'active', age: 30 },
    { id: 2, name: 'Bob', status: 'inactive', age: 45 },
    { id: 3, name: 'Charlie', status: 'active', age: 25 }
  ]
  const rowCount = (w: ReturnType<typeof mount>) =>
    w.findAll('tbody tr').filter((r) => r.find('td[colspan]').exists() === false).length

  it('renders no filter row when no column opts in', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns: plainColumns, items, paginated: false }
    })
    expect(wrapper.find('.vibe-filter-row').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders a filter row with the right control per column', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false }
    })
    const filterRow = wrapper.find('.vibe-filter-row')
    expect(filterRow.exists()).toBe(true)
    expect(filterRow.find('input.vibe-filter-text').exists()).toBe(true)
    expect(filterRow.find('select.vibe-filter-select').exists()).toBe(true)
    expect(filterRow.findAll('input.vibe-filter-range')).toHaveLength(2)
    wrapper.unmount()
  })

  it('text filter narrows to rows whose displayed value contains the query', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, columnFilters: [] }
    })
    await wrapper.find('input.vibe-filter-text').setValue('li')
    // Alice and Charlie contain "li"; Bob does not.
    expect(rowCount(wrapper)).toBe(2)
    const emitted = wrapper.emitted('update:columnFilters')
    expect(emitted).toBeTruthy()
    wrapper.unmount()
  })

  it('select filter lists faceted unique values and filters to equal', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, columnFilters: [] }
    })
    const select = wrapper.find('select.vibe-filter-select')
    const optionValues = select.findAll('option').map((o) => o.element.value)
    expect(optionValues).toContain('active')
    expect(optionValues).toContain('inactive')
    await select.setValue('inactive')
    expect(rowCount(wrapper)).toBe(1)
    expect(wrapper.text()).toContain('Bob')
    wrapper.unmount()
  })

  it('range filter narrows to rows within [min, max]', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, columnFilters: [] }
    })
    const [min, max] = wrapper.findAll('input.vibe-filter-range')
    await min.setValue('26')
    await max.setValue('40')
    // Only Alice (30) falls in [26, 40]; Charlie 25 and Bob 45 excluded.
    expect(rowCount(wrapper)).toBe(1)
    expect(wrapper.text()).toContain('Alice')
    wrapper.unmount()
  })

  it('preselects from the columnFilters model', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, columnFilters: [{ id: 'name', value: 'bob' }] }
    })
    expect(rowCount(wrapper)).toBe(1)
    expect(wrapper.text()).toContain('Bob')
    expect((wrapper.find('input.vibe-filter-text').element as HTMLInputElement).value).toBe('bob')
    wrapper.unmount()
  })
})
