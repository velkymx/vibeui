import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 3a: first-class align/width column fields and opt-in column
// visibility (v-model + chooser). All opt-in, so default rendering is unchanged.
describe('VibeDataTable column presentation (#283)', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]
  const items = [
    { id: 1, name: 'Alice', email: 'a@x.com' },
    { id: 2, name: 'Bob', email: 'b@x.com' }
  ]

  it('applies align as a Bootstrap text utility on header and cells', () => {
    const cols = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name', align: 'end' as const }
    ]
    const wrapper = mount(VibeDataTable, { props: { columns: cols, items, paginated: false } })
    expect(wrapper.findAll('thead th')[1].classes()).toContain('text-end')
    expect(wrapper.findAll('tbody tr')[0].findAll('td')[1].classes()).toContain('text-end')
    wrapper.unmount()
  })

  it('applies width (number = px, string passthrough) to the header cell', () => {
    const cols = [
      { key: 'id', label: 'ID', width: 120 },
      { key: 'name', label: 'Name', width: '10rem' }
    ]
    const wrapper = mount(VibeDataTable, { props: { columns: cols, items, paginated: false } })
    const headers = wrapper.findAll('thead th')
    expect((headers[0].element as HTMLElement).style.width).toBe('120px')
    expect((headers[1].element as HTMLElement).style.width).toBe('10rem')
    wrapper.unmount()
  })

  it('hides a column set to false in the columnVisibility model', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, columnVisibility: { email: false } }
    })
    const headerText = wrapper.findAll('thead th').map((h) => h.text())
    expect(headerText).toContain('Name')
    expect(headerText).not.toContain('Email')
    expect(wrapper.text()).not.toContain('a@x.com')
    wrapper.unmount()
  })

  it('renders no column chooser by default', () => {
    const wrapper = mount(VibeDataTable, { props: { columns, items, paginated: false } })
    expect(wrapper.find('.vibe-column-toggle').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows a chooser with a checkbox per column when showColumnToggle is set', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, showColumnToggle: true }
    })
    const toggle = wrapper.find('.vibe-column-toggle')
    expect(toggle.exists()).toBe(true)
    expect(toggle.findAll('input[type="checkbox"]')).toHaveLength(3)
    wrapper.unmount()
  })

  it('toggling a chooser checkbox hides the column and emits update:columnVisibility', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, showColumnToggle: true, columnVisibility: {} }
    })
    const boxes = wrapper.find('.vibe-column-toggle').findAll('input[type="checkbox"]')
    // Uncheck the third column (email).
    await boxes[2].setValue(false)
    const emitted = wrapper.emitted('update:columnVisibility')
    expect(emitted).toBeTruthy()
    expect((emitted![emitted!.length - 1][0] as Record<string, boolean>).email).toBe(false)
    expect(wrapper.findAll('thead th').map((h) => h.text())).not.toContain('Email')
    wrapper.unmount()
  })
})
