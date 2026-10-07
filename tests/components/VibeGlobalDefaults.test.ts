import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeButton from '../../src/components/VibeButton.vue'
import VibeToastHost from '../../src/components/VibeToastHost.vue'
import VibeModal from '../../src/components/VibeModal.vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'
import VibeFormInput from '../../src/components/VibeFormInput.vue'
import { useToast, __resetToastStoreForTests } from '../../src/composables/useToast'
import { VIBE_DEFAULTS_KEY } from '../../src/composables/vibeDefaults'
import type { VibeDefaults } from '../../src/types'

const provide = (defaults: VibeDefaults) => ({
  global: { provide: { [VIBE_DEFAULTS_KEY as symbol]: defaults } },
})

// #159: global defaults apply per key; explicit props still win.
describe('global defaults in components (#159)', () => {
  it('VibeButton resolves variant and size from globals, prop wins', () => {
    const fromGlobals = mount(VibeButton, {
      ...provide({ variant: 'danger', size: 'lg' }),
      slots: { default: 'x' },
    })
    expect(fromGlobals.classes()).toContain('btn-danger')
    expect(fromGlobals.classes()).toContain('btn-lg')

    const withProp = mount(VibeButton, {
      ...provide({ variant: 'danger', size: 'lg' }),
      props: { variant: 'success' },
      slots: { default: 'x' },
    })
    expect(withProp.classes()).toContain('btn-success')
    expect(withProp.classes()).toContain('btn-lg')
  })

  it('VibeButton keeps builtins with no globals provided', () => {
    const wrapper = mount(VibeButton, { slots: { default: 'x' } })
    expect(wrapper.classes()).toContain('btn-primary')
    expect(wrapper.classes()).not.toContain('btn-lg')
  })

  it('VibeToastHost uses the global toast position', async () => {
    __resetToastStoreForTests()
    document.body.innerHTML = ''
    const wrapper = mount(VibeToastHost, {
      attachTo: document.body,
      ...provide({ toastPosition: 'bottom-start' }),
    })
    useToast().show('hi')
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    await nextTick()
    const container = document.body.querySelector('.toast-container')!
    expect(container.classList.contains('bottom-0')).toBe(true)
    expect(container.classList.contains('start-0')).toBe(true)
    wrapper.unmount()
    __resetToastStoreForTests()
    document.body.innerHTML = ''
  })

  it('VibeModal follows the global teleport target', () => {
    document.body.innerHTML = ''
    const inline = mount(VibeModal, {
      props: { title: 't' },
      ...provide({ teleport: false }),
    })
    expect(inline.find('.modal').exists()).toBe(true)
    expect(document.body.querySelector('.modal')).toBeNull()
    inline.unmount()
    document.body.innerHTML = ''
  })

  it('VibeDataTable search honors the global debounce', async () => {
    const items = [{ name: 'Alice' }, { name: 'Bob' }]
    const columns = [{ key: 'name', label: 'Name' }] as never[]
    const wrapper = mount(VibeDataTable, {
      props: { items, columns, searchable: true },
      ...provide({ debounce: 0 }),
    })
    await wrapper.find('input[type="search"]').setValue('ali')
    await nextTick()
    await nextTick()
    expect(wrapper.findAll('tbody tr').length).toBe(1)
  })

  it('VibeFormInput hides the optional suffix from the global flag unless overridden', () => {
    const hidden = mount(VibeFormInput, {
      props: { label: 'Name' },
      ...provide({ hideOptional: true }),
    })
    expect(hidden.text()).not.toContain('(optional)')

    const shown = mount(VibeFormInput, {
      props: { label: 'Name', hideOptional: false },
      ...provide({ hideOptional: true }),
    })
    expect(shown.text()).toContain('(optional)')
  })
})
