import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import VibeTabs from '../../src/components/VibeTabs.vue'
import VibeTab from '../../src/components/VibeTab.vue'

const makeTabsHarness = (slots: string, props: Record<string, unknown> = {}) =>
  defineComponent({
    components: { VibeTabs, VibeTab },
    props: ['active', 'lazy', 'variant'],
    setup: (p) => () =>
      h(
        VibeTabs as never,
        {
          modelValue: p.active,
          'onUpdate:modelValue': (val: string) => {
            p.active = val
          },
          lazy: p.lazy,
          variant: p.variant,
          ...props
        },
        { default: () => slots }
      )
  })

describe('VibeTabs', () => {
  it('renders nav-tabs by default with one nav-link per VibeTab', async () => {
    const wrapper = mount(VibeTabs, {
      slots: {
        default: `
          <VibeTab name="a" label="Alpha">A body</VibeTab>
          <VibeTab name="b" label="Beta">B body</VibeTab>
        `
      },
      global: { components: { VibeTab } }
    })
    await nextTick()

    expect(wrapper.find('.nav-tabs').exists()).toBe(true)
    const links = wrapper.findAll('.nav-link')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('Alpha')
    expect(links[1].text()).toBe('Beta')
  })

  it('first registered tab becomes active when no modelValue', async () => {
    const wrapper = mount(VibeTabs, {
      slots: {
        default: `
          <VibeTab name="a" label="A">aaa</VibeTab>
          <VibeTab name="b" label="B">bbb</VibeTab>
        `
      },
      global: { components: { VibeTab } }
    })
    await nextTick()

    const links = wrapper.findAll('.nav-link')
    expect(links[0].classes()).toContain('active')
    expect(links[1].classes()).not.toContain('active')

    const panes = wrapper.findAll('.tab-pane')
    expect(panes[0].classes()).toContain('active')
    expect(panes[1].classes()).not.toContain('active')
  })

  it('clicking a tab activates it and emits update:modelValue', async () => {
    const wrapper = mount(VibeTabs, {
      slots: {
        default: `
          <VibeTab name="a" label="A">aaa</VibeTab>
          <VibeTab name="b" label="B">bbb</VibeTab>
        `
      },
      global: { components: { VibeTab } }
    })
    await nextTick()

    await wrapper.findAll('.nav-link')[1].trigger('click')

    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1][0]).toBe('b')

    const panes = wrapper.findAll('.tab-pane')
    expect(panes[0].classes()).not.toContain('active')
    expect(panes[1].classes()).toContain('active')
  })

  it('respects modelValue prop', async () => {
    const wrapper = mount(VibeTabs, {
      props: { modelValue: 'b' },
      slots: {
        default: `
          <VibeTab name="a" label="A">aaa</VibeTab>
          <VibeTab name="b" label="B">bbb</VibeTab>
        `
      },
      global: { components: { VibeTab } }
    })
    await nextTick()

    expect(wrapper.findAll('.nav-link')[1].classes()).toContain('active')
    expect(wrapper.text()).toContain('bbb')
  })

  it('disabled tabs cannot be activated by click', async () => {
    const wrapper = mount(VibeTabs, {
      slots: {
        default: `
          <VibeTab name="a" label="A">aaa</VibeTab>
          <VibeTab name="b" label="B" disabled>bbb</VibeTab>
        `
      },
      global: { components: { VibeTab } }
    })
    await nextTick()

    const disabledLink = wrapper.findAll('.nav-link')[1]
    expect(disabledLink.classes()).toContain('disabled')
    expect(disabledLink.attributes('disabled')).toBeDefined()
  })

  describe('lazy', () => {
    it('does not render inactive tab content when lazy=true', async () => {
      const wrapper = mount(VibeTabs, {
        props: { lazy: true },
        slots: {
          default: `
            <VibeTab name="a" label="A"><span class="a-body">A body</span></VibeTab>
            <VibeTab name="b" label="B"><span class="b-body">B body</span></VibeTab>
          `
        },
        global: { components: { VibeTab } }
      })
      await nextTick()

      expect(wrapper.find('.a-body').exists()).toBe(true)
      expect(wrapper.find('.b-body').exists()).toBe(false)
    })

    // CR9-11: visited Set was never cleaned in unregister. A remounted tab with
    // lazy:true would render immediately (hasBeenActive = true from stale visited)
    // instead of waiting for its first activation.
    it('remounted tab does not render lazily until activated when previously removed (CR9-11)', async () => {
      const showB = { value: true }
      const Harness = defineComponent({
        components: { VibeTabs, VibeTab },
        data: () => ({ showB: true, active: 'a' }),
        template: `
          <VibeTabs v-model="active" :lazy="true">
            <VibeTab name="a" label="A"><span class="a-body">A</span></VibeTab>
            <VibeTab v-if="showB" name="b" label="B"><span class="b-body">B</span></VibeTab>
          </VibeTabs>
        `
      })
      const wrapper = mount(Harness)
      await nextTick()
      void showB

      // Activate tab b → visited.has('b') = true → b renders
      await wrapper.findAll('.nav-link')[1].trigger('click')
      expect(wrapper.find('.b-body').exists()).toBe(true)

      // Unmount tab b → unregister('b') should also call visited.delete('b')
      await wrapper.setData({ showB: false })
      await nextTick()

      // Remount tab b → registers again → isActive=false → lazy rendering
      await wrapper.setData({ showB: true })
      await nextTick()

      // Without fix: visited.has('b')=true → b-body renders immediately (wrong)
      // With fix: visited cleared on unregister → b-body not shown until re-activated
      expect(wrapper.find('.b-body').exists()).toBe(false)
    })

    it('keeps tab mounted after first activation (lazy retains)', async () => {
      const wrapper = mount(VibeTabs, {
        props: { lazy: true },
        slots: {
          default: `
            <VibeTab name="a" label="A"><span class="a-body">A</span></VibeTab>
            <VibeTab name="b" label="B"><span class="b-body">B</span></VibeTab>
          `
        },
        global: { components: { VibeTab } }
      })
      await nextTick()

      await wrapper.findAll('.nav-link')[1].trigger('click')
      expect(wrapper.find('.b-body').exists()).toBe(true)

      await wrapper.findAll('.nav-link')[0].trigger('click')
      expect(wrapper.find('.a-body').exists()).toBe(true)
      expect(wrapper.find('.b-body').exists()).toBe(true)
    })
  })

  describe('variant', () => {
    it('pills variant uses .nav-pills', async () => {
      const wrapper = mount(VibeTabs, {
        props: { variant: 'pills' },
        slots: { default: `<VibeTab name="a" label="A">a</VibeTab>` },
        global: { components: { VibeTab } }
      })
      await nextTick()
      expect(wrapper.find('.nav-pills').exists()).toBe(true)
      expect(wrapper.find('.nav-tabs').exists()).toBe(false)
    })

    it('underline variant uses .nav-underline', async () => {
      const wrapper = mount(VibeTabs, {
        props: { variant: 'underline' },
        slots: { default: `<VibeTab name="a" label="A">a</VibeTab>` },
        global: { components: { VibeTab } }
      })
      await nextTick()
      expect(wrapper.find('.nav-underline').exists()).toBe(true)
    })
  })

  describe('M10 lazy is reactive in provided context', () => {
    it('flipping lazy from false → true after mount keeps already-rendered tabs but stops mounting new ones until visited', async () => {
      const wrapper = mount(VibeTabs, {
        props: { lazy: false },
        slots: {
          default: `
            <VibeTab name="a" label="A"><span class="a-body">A</span></VibeTab>
            <VibeTab name="b" label="B"><span class="b-body">B</span></VibeTab>
          `
        },
        global: { components: { VibeTab } }
      })
      await nextTick()
      expect(wrapper.find('.a-body').exists()).toBe(true)
      expect(wrapper.find('.b-body').exists()).toBe(true)

      await wrapper.setProps({ lazy: true })
      await nextTick()

      // Already-mounted tabs stay; lazy gating only affects future renders
      // because hasBeenActive('b') is still false (b was never active),
      // so b-body should now be hidden under lazy mode.
      expect(wrapper.find('.b-body').exists()).toBe(false)
    })
  })

  it('logs console.error and renders gracefully when VibeTab is used outside VibeTabs', () => {
    const errors: string[] = []
    const consoleSpy = console.error
    console.error = (...args: any[]) => errors.push(String(args[0]))
    try {
      // Should NOT throw — graceful degradation via console.error
      expect(() =>
        mount(VibeTab, { props: { name: 'a', label: 'A' } })
      ).not.toThrow()
      expect(errors.some(e => /must be a descendant of <VibeTabs>/.test(e))).toBe(true)
    } finally {
      console.error = consoleSpy
    }
  })
})

describe('VibeTabs lazy + v-model initial render (issue #67)', () => {
  it('renders the initially-active tab immediately when active is set via v-model', async () => {
    const wrapper = mount(VibeTabs, {
      props: { modelValue: 'b', lazy: true },
      slots: {
        default: `
          <VibeTab name="a" label="Alpha">A body</VibeTab>
          <VibeTab name="b" label="Beta">B body</VibeTab>
        `
      },
      global: { components: { VibeTab } }
    })
    await nextTick()
    await nextTick()
    expect(wrapper.text()).toContain('B body')
    expect(wrapper.text()).not.toContain('A body')
  })
  // #224: the registry snapshot must follow prop changes, and a rename must
  // not orphan the old entry on unmount.
  describe('registry sync (#224)', () => {
    const syncHarness = (initial: Record<string, Record<string, unknown>>) =>
      defineComponent({
        components: { VibeTabs, VibeTab },
        data() {
          return { tabs: initial as Record<string, Record<string, unknown>>, showA: true }
        },
        render() {
          const vm = this as unknown as {
            tabs: Record<string, Record<string, unknown>>
            showA: boolean
          }
          const entries = Object.entries(vm.tabs).filter(
            ([, tabProps]) => (tabProps.name as string) !== 'a2' || vm.showA
          )
          return h(VibeTabs as never, null, {
            default: () =>
              entries.map(([key, tabProps]) =>
                h(VibeTab as never, {
                  key,
                  name: tabProps.name,
                  label: tabProps.label,
                  disabled: tabProps.disabled
                })
              )
          })
        }
      })

    it('reflects label changes in the strip', async () => {
      const wrapper = mount(
        syncHarness({
          a: { name: 'a', label: 'Alpha' },
          b: { name: 'b', label: 'Beta' }
        })
      )
      await nextTick()
      expect(wrapper.findAll('.nav-link')[1].text()).toBe('Beta')
      const vm = wrapper.vm as unknown as { tabs: Record<string, Record<string, unknown>> }
      vm.tabs = {
        a: { name: 'a', label: 'Alpha' },
        b: { name: 'b', label: 'Beta2' }
      }
      await nextTick()
      expect(wrapper.findAll('.nav-link')[1].text()).toBe('Beta2')
      wrapper.unmount()
    })

    it('rename plus removal leaves no ghost tab', async () => {
      const wrapper = mount(
        syncHarness({
          a: { name: 'a', label: 'Alpha' },
          b: { name: 'b', label: 'Beta' }
        })
      )
      await nextTick()
      const vm = wrapper.vm as unknown as {
        tabs: Record<string, Record<string, unknown>>
        showA: boolean
      }
      // Rename a to a2 with a new label: the strip must show the new label,
      // proving the registry entry moved rather than duplicated.
      vm.tabs = {
        a2: { name: 'a2', label: 'Alpha2' },
        b: { name: 'b', label: 'Beta' }
      }
      await nextTick()
      expect(wrapper.findAll('.nav-link').map((l) => l.text()).sort()).toEqual(['Alpha2', 'Beta'])
      // Remove the renamed tab: nothing of it may remain.
      vm.showA = false
      await nextTick()
      expect(wrapper.findAll('.nav-link').map((l) => l.text())).toEqual(['Beta'])
      wrapper.unmount()
    })
  })

  // #235 W1: tabs own aria-controls, panes own aria-labelledby plus correct
  // tabindex; ids stay unique across two strips sharing tab names.
  describe('tab wiring (#235)', () => {
    const twoTabs = `
      <VibeTab name="a" label="Alpha">A body</VibeTab>
      <VibeTab name="shared" label="Shared">S body</VibeTab>
    `
    it('links tabs to panes with matching ids', async () => {
      const wrapper = mount(VibeTabs, {
        slots: { default: twoTabs },
        global: { components: { VibeTab } }
      })
      await nextTick()
      const tabs = wrapper.findAll('[role="tab"]')
      const panes = wrapper.findAll('[role="tabpanel"]')
      expect(panes).toHaveLength(2)
      for (const tab of tabs) {
        const controls = tab.attributes('aria-controls')
        expect(controls).toBeTruthy()
        const pane = panes.find((pn) => pn.attributes('id') === controls)
        expect(pane).toBeDefined()
        expect(pane!.attributes('aria-labelledby')).toBe(tab.attributes('id'))
      }
      // Only the active pane is tabbable.
      expect(panes[0].attributes('tabindex')).toBe('0')
      expect(panes[1].attributes('tabindex')).toBe('-1')
      wrapper.unmount()
    })

    it('keeps ids unique across two strips with the same tab names', async () => {
      const Harness = defineComponent({
        components: { VibeTabs, VibeTab },
        setup: () => () =>
          h('div', [
            h(VibeTabs as never, null, {
              default: () => [
                h(VibeTab as never, { name: 'shared', label: 'One' }, () => 'one'),
                h(VibeTab as never, { name: 'solo', label: 'Solo' }, () => 'solo')
              ]
            }),
            h(VibeTabs as never, null, {
              default: () => [
                h(VibeTab as never, { name: 'shared', label: 'Two' }, () => 'two'),
                h(VibeTab as never, { name: 'other', label: 'Other' }, () => 'other')
              ]
            })
          ])
      })
      const wrapper = mount(Harness, { attachTo: document.body })
      await nextTick()
      const ids = wrapper.findAll('[role="tab"]').map((t) => t.attributes('id'))
      const paneIds = wrapper.findAll('[role="tabpanel"]').map((t) => t.attributes('id'))
      const all = [...ids, ...paneIds]
      expect(new Set(all).size).toBe(all.length)
      wrapper.unmount()
    })
  })
})
