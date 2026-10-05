import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeFormSelect from '../../src/components/VibeFormSelect.vue'
import type { FormSelectOption } from '../../src/types'

// #131: the selection-sync watcher must still re-sync when the options set is
// replaced (new reference / different length), after dropping the deep watcher.

describe('VibeFormSelect re-syncs selection on options change (#131)', () => {
  it('updates the selected index when options are replaced (new reference)', async () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        modelValue: '2',
        options: [
          { text: 'One', value: '1' },
          { text: 'Two', value: '2' },
        ] as FormSelectOption[],
      },
    })
    const el = wrapper.find('select').element
    expect(el.selectedIndex).toBe(1)

    // Replace with a new array where the selected value sits at a different index.
    await wrapper.setProps({
      options: [
        { text: 'Two', value: '2' },
        { text: 'One', value: '1' },
      ] as FormSelectOption[],
    })
    await nextTick()
    expect(el.selectedIndex).toBe(0)
  })

  it('updates the selection when the options length changes', async () => {
    const wrapper = mount(VibeFormSelect, {
      props: {
        modelValue: '3',
        options: [
          { text: 'One', value: '1' },
          { text: 'Two', value: '2' },
        ] as FormSelectOption[],
      },
    })
    const el = wrapper.find('select').element
    // '3' is not present yet.
    expect(el.selectedIndex).toBe(-1)

    await wrapper.setProps({
      options: [
        { text: 'One', value: '1' },
        { text: 'Two', value: '2' },
        { text: 'Three', value: '3' },
      ] as FormSelectOption[],
    })
    await nextTick()
    expect(el.selectedIndex).toBe(2)
  })
})
