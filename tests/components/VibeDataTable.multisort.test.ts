import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 2a: multi-column sort. Opt-in via `multiSort`; shift-click appends
// a column (asc -> desc -> removed), plain click collapses to a single sort.
// Default (multiSort off) is unchanged single-column sort.
describe('VibeDataTable multi-sort (#283)', () => {
  const columns = [
    { key: 'group', label: 'Group' },
    { key: 'name', label: 'Name' }
  ]
  // `group` has ties that only a secondary `name` sort can break.
  const items = [
    { id: 1, group: 'B', name: 'Zoe' },
    { id: 2, group: 'A', name: 'Carl' },
    { id: 3, group: 'B', name: 'Amy' },
    { id: 4, group: 'A', name: 'Dan' }
  ]

  const bodyText = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('tbody tr').map((r) => r.text())

  it('default (multiSort off): shift-click does not add a second sort', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, sort: [] }
    })
    const headers = wrapper.findAll('thead th')
    await headers[0].trigger('click') // sort by group asc
    await headers[1].trigger('click', { shiftKey: true }) // no multi: becomes single sort by name

    const sortEvents = wrapper.emitted('update:sort')
    const last = sortEvents![sortEvents!.length - 1][0] as { id: string }[]
    expect(last).toHaveLength(1)
    expect(last[0].id).toBe('name')
    wrapper.unmount()
  })

  it('multiSort: shift-click appends a secondary sort, ordering by both', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, multiSort: true, sort: [] }
    })
    const headers = wrapper.findAll('thead th')
    await headers[0].trigger('click') // group asc
    await headers[1].trigger('click', { shiftKey: true }) // + name asc

    // A-group first (Carl, Dan), then B-group (Amy, Zoe), each name-ascending.
    expect(bodyText(wrapper).map((t) => t.replace(/\s+/g, '').trim())).toEqual([
      'ACarl',
      'ADan',
      'BAmy',
      'BZoe'
    ])
    const sortEvents = wrapper.emitted('update:sort')!
    const last = sortEvents[sortEvents.length - 1][0] as { id: string; desc: boolean }[]
    expect(last).toEqual([
      { id: 'group', desc: false },
      { id: 'name', desc: false }
    ])
    wrapper.unmount()
  })

  it('multiSort: shift-click on a sorted column cycles asc -> desc -> removed', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, multiSort: true, sort: [] }
    })
    const group = wrapper.findAll('thead th')[0]
    await group.trigger('click') // asc
    await group.trigger('click', { shiftKey: true }) // desc
    let sortEvents = wrapper.emitted('update:sort')!
    expect((sortEvents[sortEvents.length - 1][0] as { desc: boolean }[])[0].desc).toBe(true)

    await group.trigger('click', { shiftKey: true }) // removed
    sortEvents = wrapper.emitted('update:sort')!
    expect(sortEvents[sortEvents.length - 1][0]).toEqual([])
    wrapper.unmount()
  })

  it('multiSort: plain click collapses a multi-sort back to one column', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, multiSort: true, sort: [] }
    })
    const headers = wrapper.findAll('thead th')
    await headers[0].trigger('click')
    await headers[1].trigger('click', { shiftKey: true })
    await headers[1].trigger('click') // plain click on name: sole sort

    const sortEvents = wrapper.emitted('update:sort')!
    const last = sortEvents[sortEvents.length - 1][0] as { id: string }[]
    expect(last).toHaveLength(1)
    expect(last[0].id).toBe('name')
    wrapper.unmount()
  })

  it('sortBy/sortDesc reflect the primary sort in multi mode', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, multiSort: true, sort: [], sortBy: undefined, sortDesc: false }
    })
    const headers = wrapper.findAll('thead th')
    await headers[0].trigger('click') // group asc (primary)
    await headers[1].trigger('click', { shiftKey: true })

    const sortBy = wrapper.emitted('update:sortBy')!
    expect(sortBy[sortBy.length - 1][0]).toBe('group')
    wrapper.unmount()
  })

  it('multiSort: aria-sort is set on every sorted column', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, multiSort: true, sort: [] }
    })
    const headers = wrapper.findAll('thead th')
    await headers[0].trigger('click')
    await headers[1].trigger('click', { shiftKey: true })

    const refreshed = wrapper.findAll('thead th')
    expect(refreshed[0].attributes('aria-sort')).toBe('ascending')
    expect(refreshed[1].attributes('aria-sort')).toBe('ascending')
    wrapper.unmount()
  })
})
