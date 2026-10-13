import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #124: server-side (manual) mode. The backend owns filtering, sorting, and
// paging; the table renders `items` as-is, uses `totalRows` for pagination, and
// emits page/sort/search so the consumer can refetch.

const columns = [{ key: 'name', label: 'Name', sortable: true }]

async function typeSearch(wrapper: ReturnType<typeof mount>, query: string) {
  await wrapper.find('input[type="search"]').setValue(query)
  await wrapper.find('input[type="search"]').trigger('input')
  await nextTick()
  await new Promise((r) => setTimeout(r, 10))
}

describe('VibeDataTable server-side mode (#124)', () => {
  it('does not filter locally: all items stay rendered on search', async () => {
    const items = [{ name: 'Alice' }, { name: 'Bob' }]
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, serverMode: true, totalRows: 2, searchDebounce: 0 },
    })
    await typeSearch(wrapper, 'zzz')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('does not paginate locally: renders every passed item even past perPage', () => {
    const items = [{ name: 'A' }, { name: 'B' }, { name: 'C' }]
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, serverMode: true, totalRows: 30, perPage: 2 },
    })
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
  })

  it('derives pagination total from totalRows, not the loaded slice', () => {
    const items = [{ name: 'A' }, { name: 'B' }]
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, serverMode: true, totalRows: 20, perPage: 2 },
    })
    // 20 rows / 2 per page = 10 pages, so a last-page button labelled 10 exists.
    expect(wrapper.text()).toContain('of 20')
    const pageButtons = wrapper.findAll('.pagination .page-link').map((b) => b.text())
    expect(pageButtons).toContain('10')
  })

  it('does not sort locally: row order is unchanged when a header is clicked', async () => {
    const items = [{ name: 'Bob' }, { name: 'Alice' }]
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, serverMode: true, totalRows: 2 },
    })
    await wrapper.find('thead th').trigger('click')
    const firstRow = wrapper.findAll('tbody tr')[0]
    expect(firstRow.text()).toContain('Bob')
    // But the sort model is emitted so the consumer can refetch.
    expect(wrapper.emitted('update:sortBy')).toBeTruthy()
  })

  it('emits a search event with the query so the consumer can fetch', async () => {
    const items = [{ name: 'Alice' }]
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, serverMode: true, totalRows: 1, searchDebounce: 0 },
    })
    await typeSearch(wrapper, 'alice')
    const emitted = wrapper.emitted('search')
    expect(emitted).toBeTruthy()
    expect(emitted![emitted!.length - 1][0]).toBe('alice')
  })

  it('emits update:currentPage when the page changes', async () => {
    const items = [{ name: 'A' }, { name: 'B' }]
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, serverMode: true, totalRows: 20, perPage: 2 },
    })
    await wrapper.findAll('.pagination .page-link').find((b) => b.text() === '2')!.trigger('click')
    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    const last = wrapper.emitted('update:currentPage')!.pop()!
    expect(last[0]).toBe(2)
  })
})
