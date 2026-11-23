import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #70 (part a): search must match the DISPLAYED text, not just the raw row value.
// A `formatter` column searches its formatted output; a `#cell` slot column (or any
// derived text) gets an explicit `searchValue(row)` hook, which takes precedence.

async function typeSearch(wrapper: ReturnType<typeof mount>, query: string) {
  await wrapper.find('input[type="search"]').setValue(query)
  await wrapper.find('input[type="search"]').trigger('input')
  await nextTick()
  await new Promise((r) => setTimeout(r, 10))
}

describe('VibeDataTable search emission (#124, #314)', () => {
  const columns = [{ key: 'name', label: 'Name' }]
  const items = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Alina' }]

  it('emits once per actual query change, not per debounce commit', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(VibeDataTable, {
        props: { columns, items, searchable: true }
      })
      const input = wrapper.find('input[type="search"]')

      await input.setValue('Al')
      vi.advanceTimersByTime(300)
      await nextTick()
      expect(wrapper.emitted('search')).toHaveLength(1)

      // Change and revert inside one debounce window: the debounced mirror
      // commits the same value again, which must not re-emit.
      await input.setValue('Ali')
      await input.setValue('Al')
      vi.advanceTimersByTime(300)
      await nextTick()
      expect(wrapper.emitted('search')).toHaveLength(1)
      wrapper.unmount()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('VibeDataTable formatter-aware search (#70)', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', formatter: (v: unknown) => (v === 'active' ? 'Enabled' : 'Disabled') },
  ]
  const items = [
    { name: 'Alice', status: 'active' },
    { name: 'Bob', status: 'inactive' },
  ]

  it('matches rows by their formatter output', async () => {
    const wrapper = mount(VibeDataTable, { props: { columns, items, searchable: true, searchDebounce: 0 } })
    await typeSearch(wrapper, 'Enabled')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).not.toContain('Bob')
  })

  it('does not match the raw value once a formatter transforms it', async () => {
    const wrapper = mount(VibeDataTable, { props: { columns, items, searchable: true, searchDebounce: 0 } })
    await typeSearch(wrapper, 'inactive')
    expect(wrapper.text()).toContain('No data available')
  })
})

describe('VibeDataTable per-column searchValue (#70)', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'score', label: 'Score', searchValue: (row: { score: number }) => (row.score > 50 ? 'high' : 'low') },
  ]
  const items = [
    { name: 'Alice', score: 90 },
    { name: 'Bob', score: 10 },
  ]

  it('matches rows by a derived searchValue not present in the raw data', async () => {
    const wrapper = mount(VibeDataTable, { props: { columns, items, searchable: true, searchDebounce: 0 } })
    await typeSearch(wrapper, 'high')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).not.toContain('Bob')
  })

  it('searchValue takes precedence over formatter', async () => {
    const cols = [
      { key: 'name', label: 'Name' },
      {
        key: 'status',
        label: 'Status',
        formatter: () => 'FormatterText',
        searchValue: () => 'SearchText',
      },
    ]
    const wrapper = mount(VibeDataTable, { props: { columns: cols, items: [{ name: 'Alice', status: 'x' }], searchable: true, searchDebounce: 0 } })
    await typeSearch(wrapper, 'SearchText')
    expect(wrapper.text()).toContain('Alice')
    await typeSearch(wrapper, 'FormatterText')
    expect(wrapper.text()).toContain('No data available')
  })
})
