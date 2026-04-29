import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import * as bootstrap from 'bootstrap'
import { vTooltip } from '../../src/directives/vTooltip'

const flushAsync = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
  await Promise.resolve()
}

describe('v-vibe-tooltip directive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes Bootstrap Tooltip with string binding (title)', async () => {
    const Component = defineComponent({
      directives: { 'vibe-tooltip': vTooltip },
      template: '<button v-vibe-tooltip="\'Hello\'">Hover</button>'
    })

    mount(Component)
    await flushAsync()

    expect(bootstrap.Tooltip).toHaveBeenCalledTimes(1)
    const args = vi.mocked(bootstrap.Tooltip).mock.calls[0]
    expect((args[1] as { title: string }).title).toBe('Hello')
  })

  it('sets data-bs-* attributes on the bound element', async () => {
    const Component = defineComponent({
      directives: { 'vibe-tooltip': vTooltip },
      template: '<button v-vibe-tooltip="\'Tip\'">x</button>'
    })

    const wrapper = mount(Component)
    await flushAsync()

    const el = wrapper.find('button').element
    expect(el.getAttribute('data-bs-toggle')).toBe('tooltip')
    expect(el.getAttribute('data-bs-title')).toBe('Tip')
    expect(el.getAttribute('data-bs-placement')).toBe('top')
  })

  it('accepts options object with placement and html', async () => {
    const Component = defineComponent({
      directives: { 'vibe-tooltip': vTooltip },
      template: '<button v-vibe-tooltip="{ title: \'X\', placement: \'bottom\', html: true }">y</button>'
    })

    const wrapper = mount(Component)
    await flushAsync()

    const args = vi.mocked(bootstrap.Tooltip).mock.calls[0]
    const opts = args[1] as { title: string; placement: string; html: boolean }
    expect(opts.title).toBe('X')
    expect(opts.placement).toBe('bottom')
    expect(opts.html).toBe(true)

    const el = wrapper.find('button').element
    expect(el.getAttribute('data-bs-placement')).toBe('bottom')
    expect(el.getAttribute('data-bs-html')).toBe('true')
  })

  it('updates content via setContent on binding change', async () => {
    const Component = defineComponent({
      directives: { 'vibe-tooltip': vTooltip },
      props: ['msg'],
      template: '<button v-vibe-tooltip="msg">x</button>'
    })

    const wrapper = mount(Component, { props: { msg: 'one' } })
    await flushAsync()
    const instance = vi.mocked(bootstrap.Tooltip).mock.results[0].value

    await wrapper.setProps({ msg: 'two' })
    expect(instance.setContent).toHaveBeenCalledWith({ '.tooltip-inner': 'two' })
  })

  it('disposes the Bootstrap instance on unmount', async () => {
    const Component = defineComponent({
      directives: { 'vibe-tooltip': vTooltip },
      template: '<button v-vibe-tooltip="\'X\'">y</button>'
    })

    const wrapper = mount(Component)
    await flushAsync()
    const instance = vi.mocked(bootstrap.Tooltip).mock.results[0].value

    wrapper.unmount()
    expect(instance.dispose).toHaveBeenCalledTimes(1)
  })

  it('handles undefined/empty binding without throwing', async () => {
    const Component = defineComponent({
      directives: { 'vibe-tooltip': vTooltip },
      template: '<button v-vibe-tooltip>y</button>'
    })

    expect(() => mount(Component)).not.toThrow()
    await flushAsync()

    expect(bootstrap.Tooltip).toHaveBeenCalledTimes(1)
  })

  it('idempotent unmount: double unmount does not throw', async () => {
    const Component = defineComponent({
      directives: { 'vibe-tooltip': vTooltip },
      render: () => h('button', { 'v-vibe-tooltip': 'x' }, 'x')
    })

    const wrapper = mount({
      directives: { 'vibe-tooltip': vTooltip },
      template: '<button v-vibe-tooltip="\'Hi\'">x</button>'
    })
    await flushAsync()
    wrapper.unmount()
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
