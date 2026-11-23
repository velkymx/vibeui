import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'

// #310: useSlots() returns a plain, non-reactive object, so slot presence must
// be read during render. Reading it in a computed cached the first answer
// forever and a slot supplied after mount never rendered.
describe('VibeDataTable conditionally supplied slots (#310)', () => {
  const columns = [{ key: 'name', label: 'Name' }]
  const items = [{ id: 1, name: 'Alice' }]

  it('renders an #expanded slot supplied after mount', async () => {
    const show = ref(false)
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            VibeDataTable,
            { columns, items, paginated: false, expandable: true, expandedRows: ['1'] },
            show.value
              ? {
                  expanded: (scope: { item: { name: string } }) =>
                    h('div', { class: 'detail' }, scope.item.name)
                }
              : {}
          )
      }
    })
    const wrapper = mount(Host)
    expect(wrapper.find('.detail').exists()).toBe(false)

    show.value = true
    await nextTick()
    expect(wrapper.find('.detail').exists()).toBe(true)
    expect(wrapper.find('.detail').text()).toBe('Alice')
    wrapper.unmount()
  })

  it('renders a footer slot supplied after mount', async () => {
    const show = ref(false)
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            VibeDataTable,
            { columns, items, paginated: false },
            show.value ? { 'footer(name)': () => h('span', { class: 'foot' }, 'Total') } : {}
          )
      }
    })
    const wrapper = mount(Host)
    expect(wrapper.find('tfoot').exists()).toBe(false)

    show.value = true
    await nextTick()
    expect(wrapper.find('tfoot').exists()).toBe(true)
    expect(wrapper.find('.foot').text()).toBe('Total')
    wrapper.unmount()
  })
})
