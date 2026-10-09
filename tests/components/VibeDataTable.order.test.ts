import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 3c (optional): programmatic column order via the columnOrder
// v-model plus the moveColumn method. No drag UI in this slice.
describe('VibeDataTable column order (#283)', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]
  const items = [{ id: 1, name: 'Alice', email: 'a@x.com' }]
  const base = { columns, items, paginated: false }
  const headerText = (wrapper: { findAll: (s: string) => { map: (f: (h: { text: () => string }) => string) => string[] } }): string[] =>
    wrapper.findAll('thead th').map((h) => h.text())

  it('renders props order by default', () => {
    const wrapper = mount(VibeDataTable, { props: { ...base } })
    expect(headerText(wrapper)).toEqual(['ID', 'Name', 'Email'])
    wrapper.unmount()
  })

  it('follows the columnOrder model', () => {
    const wrapper = mount(VibeDataTable, {
      props: { ...base, columnOrder: ['email', 'id', 'name'] }
    })
    expect(headerText(wrapper)).toEqual(['Email', 'ID', 'Name'])
    const cells = wrapper.findAll('tbody tr')[0].findAll('td')
    expect(cells[0].text()).toBe('a@x.com')
    wrapper.unmount()
  })

  it('moveColumn reorders and emits update:columnOrder', async () => {
    const wrapper = mount(VibeDataTable, { props: { ...base, columnOrder: [] } })
    ;(wrapper.vm as unknown as { moveColumn: (key: string, to: number) => void }).moveColumn('email', 0)
    await wrapper.vm.$nextTick()
    expect(headerText(wrapper)[0]).toBe('Email')
    const emitted = wrapper.emitted('update:columnOrder')
    expect(emitted).toBeTruthy()
    expect(emitted![emitted!.length - 1][0]).toEqual(['email', 'id', 'name'])
    wrapper.unmount()
  })

  it('ignores unknown keys in the model', () => {
    const wrapper = mount(VibeDataTable, {
      props: { ...base, columnOrder: ['zzz', 'name'] }
    })
    // Known columns render; unknown keys never create columns.
    expect(headerText(wrapper)).toEqual(['Name', 'ID', 'Email'])
    wrapper.unmount()
  })
})
