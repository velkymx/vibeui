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

      await wrapper.findAll('.vibe-autocomplete-item')[0].trigger('click')

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

    // CR9-2: async source rejections were unhandled — results stayed stale,
    // component was left open, and an unhandledrejection event fired.
    // We populate results with a first successful call, then trigger a failure;
    // the stale results must be cleared and the dropdown must close.
    it('clears stale results and closes dropdown when async source rejects', async () => {
      let callCount = 0
      const source = vi.fn(async (_q: string): Promise<string[]> => {
        callCount++
        if (callCount >= 2) throw new Error('network error')
        return ['result-1', 'result-2']
      })
      const wrapper = mount(VibeAutocomplete, {
        props: { source, minChars: 1, debounce: 0 }
      })
      const input = wrapper.find('input')

      // First query: succeeds — populate results
      await input.setValue('a')
      await flush(0)
      expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(2)

      // Second query: source throws — results must be cleared, dropdown closed
      await input.setValue('ab')
      await flush(0)
      expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
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

    // Regression: ArrowUp had no !isOpen guard. When closed, pressing ArrowUp
    // mutated highlightedIndex to results.length - 1 (stale from previous query).
    // The next ArrowDown would then open the dropdown with wrong initial highlight.
    it('ArrowUp when dropdown is closed is a no-op (dropdown stays closed)', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: items, minChars: 0, debounce: 0 }
      })
      const input = wrapper.find('input')

      // Open, get results, then close
      await input.setValue('a')
      await flush(20)
      await input.trigger('keydown', { key: 'ArrowDown' }) // highlight index 0
      await input.trigger('keydown', { key: 'Escape' }) // close

      // Now closed with stale results — ArrowUp must not wrap to last item
      await input.trigger('keydown', { key: 'ArrowUp' })

      // Dropdown stays closed — ArrowUp must not re-open
      expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)

      // ArrowDown opens; a second ArrowDown highlights the first item
      await input.trigger('keydown', { key: 'ArrowDown' }) // opens
      await flush(20)
      await input.trigger('keydown', { key: 'ArrowDown' }) // highlights index 0
      // First item must be highlighted (index 0), not last (index 2) that ArrowUp would have set
      const highlighted = wrapper.find('.vibe-autocomplete-item-highlighted')
      expect(highlighted.text()).toBe('Alpha')
    })

    // CR9-15: WAI-ARIA combobox — ArrowUp at first item must NOT wrap to last.
    // Non-standard wrap confuses keyboard users. Fix: Math.max(0, index - 1).
    it('ArrowUp from first item stays at first item — no wrap to last (CR9-15)', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: items, minChars: 0, debounce: 0 }
      })
      const input = wrapper.find('input')
      await input.setValue('')
      await flush(20)  // debounce:0 → results loaded synchronously, isOpen = true

      // First ArrowDown moves highlight from -1 to 0 (Alpha) — dropdown already open
      await input.trigger('keydown', { key: 'ArrowDown' })

      // Now at index 0. ArrowUp must stay at index 0, not wrap to Gamma (index 2).
      await input.trigger('keydown', { key: 'ArrowUp' })

      const highlighted = wrapper.find('.vibe-autocomplete-item-highlighted')
      expect(highlighted.text()).toBe('Alpha')
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

  describe('M1 close on outside click, not blur', () => {
    it('clicking outside the component closes the menu', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: ['apple', 'apricot'], minChars: 1, debounce: 0 },
        attachTo: document.body
      })
      await wrapper.find('input').setValue('a')
      await flush(20)
      expect(wrapper.findAll('.vibe-autocomplete-item').length).toBeGreaterThan(0)

      const outside = document.createElement('div')
      document.body.appendChild(outside)
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      await flush(0)

      expect(wrapper.findAll('.vibe-autocomplete-item')).toHaveLength(0)
      outside.remove()
      wrapper.unmount()
    })

    it('clicking inside the menu does NOT close it', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: ['apple', 'apricot'], minChars: 1, debounce: 0 },
        attachTo: document.body
      })
      await wrapper.find('input').setValue('a')
      await flush(20)

      const menu = wrapper.find('.vibe-autocomplete-menu').element
      menu.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      await flush(0)

      expect(wrapper.findAll('.vibe-autocomplete-item').length).toBeGreaterThan(0)
      wrapper.unmount()
    })
  })

  describe('M2 highlight preserved across queries', () => {
    it('keeps highlight on the same label when a query update returns it again', async () => {
      const wrapper = mount(VibeAutocomplete, {
        props: { source: ['apple', 'apricot', 'banana'], minChars: 1, debounce: 0 }
      })
      await wrapper.find('input').setValue('a')
      await flush(20)

      // Highlight 'apricot'
      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })

      let highlighted = wrapper.find('.vibe-autocomplete-item-highlighted')
      expect(highlighted.text()).toBe('apricot')

      // Type more — apricot still in result list
      await wrapper.find('input').setValue('ap')
      await flush(20)

      highlighted = wrapper.find('.vibe-autocomplete-item-highlighted')
      expect(highlighted.exists()).toBe(true)
      expect(highlighted.text()).toBe('apricot')
    })
  })

  // CR9-6: when T is an object and itemText is not provided, labelOf falls through
  // to String(item) → '[object Object]'. All results display identically. A DEV
  // warning on first occurrence helps developers discover the required itemText prop.
  describe('object-item labelOf DEV warning (CR9-6)', () => {
    it('warns once when object items are used without itemText prop', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const objectSource = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
      const wrapper = mount(VibeAutocomplete, {
        props: { source: objectSource, minChars: 0, debounce: 0 }
      })
      await wrapper.find('input').setValue('a')
      await flush(20)

      // labelOf called on each object item — should warn about missing itemText
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('itemText')
      )
      warnSpy.mockRestore()
      wrapper.unmount()
    })

    it('does not warn when itemText is provided for object items', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const objectSource = [{ id: 1, name: 'Alice' }]
      const wrapper = mount(VibeAutocomplete, {
        props: {
          source: objectSource,
          minChars: 0,
          debounce: 0,
          itemText: (item: { id: number; name: string }) => item.name
        }
      })
      await wrapper.find('input').setValue('a')
      await flush(20)

      expect(warnSpy).not.toHaveBeenCalled()
      warnSpy.mockRestore()
      wrapper.unmount()
    })

    it('does not warn for string items', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(VibeAutocomplete, {
        props: { source: ['Alice', 'Bob'], minChars: 0, debounce: 0 }
      })
      await wrapper.find('input').setValue('a')
      await flush(20)

      expect(warnSpy).not.toHaveBeenCalled()
      warnSpy.mockRestore()
      wrapper.unmount()
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
