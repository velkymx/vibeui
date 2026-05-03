import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeAlert from '../../src/components/VibeAlert.vue'
import * as bootstrap from 'bootstrap'

describe('VibeAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Success alert',
        variant: 'success'
      }
    })

    expect(wrapper.find('.alert-success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Success alert')
  })

  it('initializes bootstrap alert on mount', async () => {
    mount(VibeAlert, {
      props: {
        message: 'Test'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Alert).toHaveBeenCalled()
  })

  it('closes via bootstrap instance when modelValue changes to false', async () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Test',
        modelValue: true
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Alert).mock.results[0].value

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.close).toHaveBeenCalled()
  })

  it('removes element from DOM when closed event fires', async () => {
    const wrapper = mount(VibeAlert, {
      props: {
        message: 'Test'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    // Simulate Bootstrap's 'closed.bs.alert' event
    await wrapper.find('.alert').element.dispatchEvent(new Event('closed.bs.alert'))

    expect(wrapper.find('.alert').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('renders default slot content (rich VNodes) when provided', () => {
    const wrapper = mount(VibeAlert, {
      props: { variant: 'warning' },
      slots: {
        default: '<strong class="rich">Locked</strong> <button class="btn btn-sm btn-primary">Unlock</button>'
      }
    })

    expect(wrapper.find('.alert-warning .rich').exists()).toBe(true)
    expect(wrapper.find('.alert-warning .btn-primary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Locked')
  })

  it('slot wins over message prop when both provided', () => {
    const wrapper = mount(VibeAlert, {
      props: { message: 'fallback text', variant: 'info' },
      slots: { default: '<span class="from-slot">slot text</span>' }
    })

    expect(wrapper.find('.from-slot').exists()).toBe(true)
    expect(wrapper.text()).toContain('slot text')
    expect(wrapper.text()).not.toContain('fallback text')
  })

  it('falls back to message prop when no slot provided', () => {
    const wrapper = mount(VibeAlert, {
      props: { message: 'plain message' }
    })

    expect(wrapper.text()).toContain('plain message')
  })

  it('renders without message prop when slot is provided (message optional)', () => {
    const wrapper = mount(VibeAlert, {
      slots: { default: '<span class="only-slot">only slot</span>' }
    })

    expect(wrapper.find('.alert').exists()).toBe(true)
    expect(wrapper.find('.only-slot').exists()).toBe(true)
  })

  it('renders dismissable close button alongside slot content', () => {
    const wrapper = mount(VibeAlert, {
      props: { dismissable: true },
      slots: { default: '<span>body</span>' }
    })

    expect(wrapper.find('.alert-dismissible').exists()).toBe(true)
    expect(wrapper.find('button.btn-close').exists()).toBe(true)
    expect(wrapper.text()).toContain('body')
  })

  it('renders empty body when neither message nor slot provided', () => {
    const wrapper = mount(VibeAlert)
    const alert = wrapper.find('.alert')
    expect(alert.exists()).toBe(true)
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toBe('')
  })

  describe('M15 dismissible alias', () => {
    it('dismissible (correctly spelled) shows the close button', () => {
      const wrapper = mount(VibeAlert, {
        props: { message: 'x', dismissible: true }
      })
      expect(wrapper.find('.alert-dismissible').exists()).toBe(true)
      expect(wrapper.find('button.btn-close').exists()).toBe(true)
    })

    it('dismissable (legacy) still works', () => {
      const wrapper = mount(VibeAlert, {
        props: { message: 'x', dismissable: true }
      })
      expect(wrapper.find('.alert-dismissible').exists()).toBe(true)
    })

    it('either prop being true is sufficient', () => {
      const wrapper = mount(VibeAlert, {
        props: { message: 'x', dismissable: false, dismissible: true }
      })
      expect(wrapper.find('button.btn-close').exists()).toBe(true)
    })

    it('using dismissable emits a deprecation warning in dev', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(VibeAlert, {
        props: { message: 'x', dismissable: true }
      })
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('dismissable')
      )
      warn.mockRestore()
    })
  })
})
