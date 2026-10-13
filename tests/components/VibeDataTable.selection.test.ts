import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 1: row selection. Opt-in leading checkbox column powered by the
// engine's rowSelectionFeature; identity via rowKey. Default (selectable off)
// renders no checkbox so existing DOM is unchanged.
describe('VibeDataTable row selection (#283)', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ]
  const items = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ]

  it('renders no checkbox column when selectable is off (default)', () => {
    const wrapper = mount(VibeDataTable, { props: { columns, items } })
    expect(wrapper.findAll('thead th')).toHaveLength(2)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders a leading checkbox column when selectable is multiple', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, selectable: 'multiple', paginated: false }
    })
    // Leading select column: 2 data headers + 1 select header.
    expect(wrapper.findAll('thead th')).toHaveLength(3)
    // One select-all header checkbox plus one per row.
    expect(wrapper.findAll('thead input[type="checkbox"]')).toHaveLength(1)
    expect(wrapper.findAll('tbody input[type="checkbox"]')).toHaveLength(3)
    wrapper.unmount()
  })

  it('toggling a row checkbox emits update:selectedRows and row-selected', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, selectable: 'multiple', paginated: false, selectedRows: [] }
    })
    const firstRowBox = wrapper.findAll('tbody input[type="checkbox"]')[0]
    await firstRowBox.trigger('click')

    const selectionEvents = wrapper.emitted('update:selectedRows')
    expect(selectionEvents).toBeTruthy()
    expect(selectionEvents![selectionEvents!.length - 1][0]).toEqual(['1'])

    const rowSelected = wrapper.emitted('row-selected')
    expect(rowSelected).toBeTruthy()
    expect(rowSelected![0][0]).toEqual(items[0])
    expect(rowSelected![0][1]).toBe(true)
    wrapper.unmount()
  })

  it('preselects rows from the selectedRows model', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, selectable: 'multiple', paginated: false, selectedRows: ['2'] }
    })
    const boxes = wrapper.findAll('tbody input[type="checkbox"]')
    expect((boxes[0].element as HTMLInputElement).checked).toBe(false)
    expect((boxes[1].element as HTMLInputElement).checked).toBe(true)
    expect((boxes[2].element as HTMLInputElement).checked).toBe(false)
    wrapper.unmount()
  })

  it('select-all header selects every row, indeterminate when partial', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, selectable: 'multiple', paginated: false, selectedRows: [] }
    })
    const headerBox = wrapper.find('thead input[type="checkbox"]')
    await headerBox.trigger('click')
    const selectionEvents = wrapper.emitted('update:selectedRows')!
    expect(selectionEvents[selectionEvents.length - 1][0]).toEqual(['1', '2', '3'])
    wrapper.unmount()
  })

  it('header checkbox is indeterminate when only some rows are selected', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, selectable: 'multiple', paginated: false, selectedRows: ['1'] }
    })
    const headerBox = wrapper.find('thead input[type="checkbox"]').element as HTMLInputElement
    expect(headerBox.indeterminate).toBe(true)
    expect(headerBox.checked).toBe(false)
    wrapper.unmount()
  })

  it('single mode keeps only one row selected and renders no select-all', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, selectable: 'single', paginated: false, selectedRows: [] }
    })
    // No select-all header checkbox in single mode.
    expect(wrapper.findAll('thead input[type="checkbox"]')).toHaveLength(0)

    const boxes = wrapper.findAll('tbody input[type="checkbox"]')
    await boxes[0].trigger('click')
    await boxes[2].trigger('click')

    const selectionEvents = wrapper.emitted('update:selectedRows')!
    expect(selectionEvents[selectionEvents.length - 1][0]).toEqual(['3'])
    wrapper.unmount()
  })
})
