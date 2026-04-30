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

  describe('async race protection (C1)', () => {
    type Resolver = (val: string[]) => void

    const makeControllable = () => {
      const calls: Array<{ query: string; resolve: Resolver }> = []
      const source = (query: string) => new Promise<string[]>(resolve => {
        calls.push({ query, resolve })
      })
      return { source, calls }
    }

    it('drops stale results when an older request resolves after a newer one', async () => {
      const { source, calls } = makeControllable()
      const wrapper = mount(VibeAutocomplete, {
        props: { source, minChars: 1, debounce: 0 }
      })

      await wrapper.find('input').setValue('first')
      await flush(0)
      await wrapper.find('input').setValue('second')
      await flush(0)

      expect(calls).toHaveLength(2)

      // Resolve second (newer) first
      calls[1].resolve(['second-A', 'second-B'])
      await flush(0)
      expect(wrapper.findAll('.vibe-autocomplete-item').map(i => i.text()))
        .toEqual(['second-A', 'second-B'])

      // Now resolve first (stale) — must NOT overwrite
      calls[0].resolve(['stale-1', 'stale-2'])
      await flush(0)
      expect(wrapper.findAll('.vibe-autocomplete-item').map(i => i.text()))
        .toEqual(['second-A', 'second-B'])
    })

    it('does not reopen the menu when a stale result resolves after closeMenu', async () => {
      const { source, calls } = makeControllable()
      const wrapper = mount(VibeAutocomplete, {
        props: { source, minChars: 1, debounce: 0 }
      })

      await wrapper.find('input').setValue('q')
      await flush(0)
      expect(calls).toHaveLength(1)

      await wrapper.find('input').trigger('keydown', { key: 'Escape' })
      expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)

      calls[0].resolve(['ghost-1'])
      await flush(0)
      // Stale result post-close must not render anything
      expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)
    })

    it('drops stale results triggered by onFocus when input has changed', async () => {
      const { source, calls } = makeControllable()
      const wrapper = mount(VibeAutocomplete, {
        props: { source, minChars: 1, debounce: 0, modelValue: 'a' }
      })

      // Focus triggers a runQuery for current value
      await wrapper.find('input').trigger('focus')
      await flush(0)
      expect(calls).toHaveLength(1)

      // User types — newer query
      await wrapper.find('input').setValue('ab')
      await flush(0)
      expect(calls).toHaveLength(2)

      // Resolve the newer one first
      calls[1].resolve(['live'])
      await flush(0)
      expect(wrapper.findAll('.vibe-autocomplete-item').map(i => i.text())).toEqual(['live'])

      // Stale focus result must not clobber
      calls[0].resolve(['stale'])
      await flush(0)
      expect(wrapper.findAll('.vibe-autocomplete-item').map(i => i.text())).toEqual(['live'])
    })
  })
})
