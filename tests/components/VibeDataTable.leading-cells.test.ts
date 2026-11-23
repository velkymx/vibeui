import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #309: every row renders the same leading control columns, in header order
// (select, then expand). Leaf rows were reversed and lost the expand cell when
// grouping added the column without expandable.
const classNames = (el: Element): string[] =>
  Array.from(el.children).map((child) => child.className)

describe('VibeDataTable leading control columns (#309)', () => {
  const columns = [
    { key: 'dept', label: 'Dept' },
    { key: 'name', label: 'Name' }
  ]
  const items = [
    { id: 1, dept: 'Eng', name: 'Alice' },
    { id: 2, dept: 'Eng', name: 'Bob' },
    { id: 3, dept: 'Ops', name: 'Cara' }
  ]

  it('keeps select/expand body cells in header order when both are on', () => {
    const wrapper = mount(VibeDataTable, {
      props: {
        columns,
        items,
        paginated: false,
        selectable: 'multiple',
        expandable: true,
        expandedRows: []
      }
    })
    const header = classNames(wrapper.find('thead tr').element)
    const body = classNames(wrapper.findAll('tbody tr')[0].element)
    wrapper.unmount()

    expect(header.slice(0, 2)).toEqual(['vibe-select-cell', 'vibe-expand-cell'])
    expect(body.slice(0, 2)).toEqual(header.slice(0, 2))
    expect(body).toHaveLength(header.length)
  })

  it('renders the expand cell for leaf rows when grouping without expandable', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, groupBy: 'dept', expandedRows: [] }
    })
    const header = classNames(wrapper.find('thead tr').element)
    await wrapper.find('.vibe-group-row .vibe-expand-toggle').trigger('click')
    const leafCells = wrapper
      .findAll('tbody tr')
      .filter((row) => !row.classes().includes('vibe-group-row'))
      .map((row) => classNames(row.element))
    wrapper.unmount()

    // Grouping adds the expand column even though expandable is off.
    expect(header[0]).toBe('vibe-expand-cell')
    expect(leafCells.length).toBeGreaterThan(0)
    for (const cells of leafCells) {
      expect(cells).toHaveLength(header.length)
      expect(cells[0]).toBe('vibe-expand-cell')
    }
  })
})
