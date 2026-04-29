import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VibeAutocomplete from '../../src/components/VibeAutocomplete.vue'

const flush = async (ms = 0) => {
  await new Promise(r => setTimeout(r, ms))
  await nextTick()
}

describe('VibeAutocomplete', () => {
  describe('static array source', () => {
    const fruits = ['apple', 'apricot', 'banana', 'cherry', 'date']

    it('renders an input with form-control class', () => {
      const wrapper = mount(VibeAutocomplete, { props: { source: fruits } })
      expect(wrapper.find('input.form-control').exists()).toBe(true)
    })

    it('shows filtered results after typing minChars', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: fruits, minChars: 1, debounce: 0 }
      })
      const input = wrapper.find('input')
      await input.setValue('ap')
      await flush(20)

      const items = wrapper.findAll('.vibe-autocomplete-item')
      expect(items.length).toBeGreaterThan(0)
      expect(items.map(i => i.text())).toEqual(expect.arrayContaining(['apple', 'apricot']))
    })

    it('does not query below minChars', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: fruits, minChars: 3, debounce: 0 }
      })
      await wrapper.find('input').setValue('ap')
      await flush(20)
      expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)
    })

    it('clicking an item emits select and update:modelValue', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: fruits, minChars: 1, debounce: 0 }
      })
      await wrapper.find('input').setValue('a')
      await flush(20)

      await wrapper.findAll('.vibe-autocomplete-item')[0].trigger('mousedown')

      const selected = wrapper.emitted('select') as unknown[][]
      expect(selected[0][0]).toBe('apple')
      const model = wrapper.emitted('update:modelValue') as string[][]
      expect(model[model.length - 1][0]).toBe('apple')
    })
  })

  describe('async source', () => {
    it('calls async source with query and renders results', async () => {
      const source = vi.fn(async (q: string) => {
        return [`${q}-1`, `${q}-2`]
      })
      const wrapper = mount(VibeAutocomplete, {
        props: { source, minChars: 1, debounce: 0 }
      })

      await wrapper.find('input').setValue('xy')
      await flush(20)

      expect(source).toHaveBeenCalledWith('xy')
      const items = wrapper.findAll('.vibe-autocomplete-item')
      expect(items.map(i => i.text())).toEqual(['xy-1', 'xy-2'])
    })

    it('debounces async calls', async () => {
      const source = vi.fn(async (q: string) => [q])
      const wrapper = mount(VibeAutocomplete, {
        props: { source, minChars: 1, debounce: 50 }
      })

      await wrapper.find('input').setValue('a')
      await wrapper.find('input').setValue('ab')
      await wrapper.find('input').setValue('abc')
      await flush(80)

      expect(source).toHaveBeenCalledTimes(1)
      expect(source).toHaveBeenCalledWith('abc')
    })
  })

  describe('keyboard navigation', () => {
    const items = ['Alpha', 'Beta', 'Gamma']

    it('ArrowDown highlights next item', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: items, minChars: 0, debounce: 0 }
      })
      const input = wrapper.find('input')
      await input.setValue('a')
      await flush(20)

      await input.trigger('keydown', { key: 'ArrowDown' })

      const highlighted = wrapper.find('.vibe-autocomplete-item-highlighted')
      expect(highlighted.exists()).toBe(true)
    })

    it('Enter selects highlighted item', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: items, minChars: 0, debounce: 0 }
      })
      const input = wrapper.find('input')
      await input.setValue('')
      await flush(20)

      await input.trigger('keydown', { key: 'ArrowDown' })
      await input.trigger('keydown', { key: 'Enter' })

      const selected = wrapper.emitted('select') as string[][]
      expect(selected).toBeTruthy()
      expect(selected[0][0]).toBe('Alpha')
    })

    it('Escape closes the menu', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: items, minChars: 0, debounce: 0 }
      })
      const input = wrapper.find('input')
      await input.setValue('a')
      await flush(20)
      expect(wrapper.findAll('.vibe-autocomplete-item').length).toBeGreaterThan(0)

      await input.trigger('keydown', { key: 'Escape' })
      expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)
    })
  })

  describe('empty state', () => {
    it('renders empty slot when no results', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: ['x'], minChars: 1, debounce: 0 },
        slots: { empty: '<div class="empty-msg">Nothing found</div>' }
      })
      await wrapper.find('input').setValue('zzz')
      await flush(20)
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })
  })
})
