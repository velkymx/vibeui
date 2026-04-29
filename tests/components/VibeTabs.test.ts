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

  it('throws when VibeTab is used outside VibeTabs', () => {
    const consoleSpy = console.error
    console.error = () => {}
    try {
      expect(() =>
        mount(VibeTab, { props: { name: 'a', label: 'A' } })
      ).toThrow(/must be a descendant of <VibeTabs>/)
    } finally {
      console.error = consoleSpy
    }
  })
})
