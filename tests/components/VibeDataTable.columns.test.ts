import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #283 Phase 3a: first-class align/width column fields and opt-in column
// visibility (v-model + chooser). All opt-in, so default rendering is unchanged.
describe('VibeDataTable column presentation (#283)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it('wires the chooser trigger to its menu with aria-controls', () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, showColumnToggle: true }
    })
    const trigger = wrapper.find('.vibe-column-toggle button')
    const menu = wrapper.find('.dropdown-menu')
    expect(trigger.attributes('aria-controls')).toBe(menu.attributes('id'))
    expect(menu.attributes('id')).toBeTruthy()
    wrapper.unmount()
  })

  it('dismisses the chooser on an outside pointerdown', async () => {
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, showColumnToggle: true }
    })
    const trigger = wrapper.find('.vibe-column-toggle button')
    await trigger.trigger('click')
    expect(wrapper.find('.dropdown-menu').classes()).toContain('show')

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('.dropdown-menu').classes()).not.toContain('show')
    wrapper.unmount()
  })

  it('dismisses the chooser on Escape and returns focus to the trigger', async () => {
    const wrapper = mount(VibeDataTable, {
      attachTo: document.body,
      props: { columns, items, paginated: false, showColumnToggle: true }
    })
    const trigger = wrapper.find('.vibe-column-toggle button')
    await trigger.trigger('click')
    expect(wrapper.find('.dropdown-menu').classes()).toContain('show')

    await trigger.trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(wrapper.find('.dropdown-menu').classes()).not.toContain('show')
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('subscribes the dismissal listener only while the chooser is enabled', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, showColumnToggle: false }
    })
    expect(addSpy).not.toHaveBeenCalledWith('pointerdown', expect.any(Function))

    await wrapper.setProps({ showColumnToggle: true })
    expect(addSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function))

    await wrapper.setProps({ showColumnToggle: false })
    expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function))
    wrapper.unmount()
  })

  it('removes the document pointerdown listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(VibeDataTable, {
      props: { columns, items, paginated: false, showColumnToggle: true }
    })
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function))
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
