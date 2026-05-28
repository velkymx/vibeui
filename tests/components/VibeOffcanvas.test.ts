import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeOffcanvas from '../../src/components/VibeOffcanvas.vue'
import * as bootstrap from 'bootstrap'

describe('VibeOffcanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeOffcanvas, {
      props: {
        id: 'test-offcanvas',
        title: 'Offcanvas Title',
        teleport: false
      }
    })

    expect(wrapper.find('.offcanvas').exists()).toBe(true)
    expect(wrapper.find('.offcanvas-title').text()).toBe('Offcanvas Title')
    expect(wrapper.find('.offcanvas-body').exists()).toBe(true)
  })

  it('applies placement class', () => {
    const wrapper = mount(VibeOffcanvas, {
      props: {
        id: 'test-offcanvas',
        placement: 'end',
        teleport: false
      }
    })

    expect(wrapper.find('.offcanvas').classes()).toContain('offcanvas-end')
  })

  it('shows when modelValue is true', async () => {
    mount(VibeOffcanvas, {
      props: {
        id: 'test-offcanvas',
        modelValue: true,
        teleport: false
      }
    })

    // Wait for dynamic import and initialization
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.Offcanvas).toHaveBeenCalled()
    const mockInstance = vi.mocked(bootstrap.Offcanvas).mock.results[0].value
    expect(mockInstance.show).toHaveBeenCalled()
  })

  it('shows when modelValue changes to true', async () => {
    const wrapper = mount(VibeOffcanvas, {
      props: {
        id: 'test-offcanvas',
        modelValue: false,
        teleport: false
      }
    })

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 0))

    await wrapper.setProps({ modelValue: true })
    const mockInstance = vi.mocked(bootstrap.Offcanvas).mock.results[0].value
    expect(mockInstance.show).toHaveBeenCalled()
  })

  it('does not stack event listeners on re-init (placement change)', async () => {
    const wrapper = mount(VibeOffcanvas, {
      props: { id: 'test-offcanvas', placement: 'start', teleport: false }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    await wrapper.setProps({ placement: 'end' })
    await new Promise(resolve => setTimeout(resolve, 0))

    wrapper.find('.offcanvas').element.dispatchEvent(new Event('shown.bs.offcanvas'))

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual([true])
  })

  it('hides when modelValue changes to false', async () => {
    const wrapper = mount(VibeOffcanvas, {
      props: {
        id: 'test-offcanvas',
        modelValue: true,
        teleport: false
      }
    })

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Offcanvas).mock.results[0].value

    // Simulating the event that sets isVisible internal state (now fired on 'shown', not 'show')
    const offcanvasEl = wrapper.find('.offcanvas').element
    offcanvasEl.dispatchEvent(new Event('shown.bs.offcanvas'))

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.hide).toHaveBeenCalled()
  })

  it('cleans up on unmount', async () => {
    const wrapper = mount(VibeOffcanvas, {
      props: { teleport: false }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Offcanvas).mock.results[0].value

    wrapper.unmount()
    expect(mockInstance.dispose).toHaveBeenCalled()
  })

  // Regression: isUnmounted guard — Bootstrap constructor must not run on a detached
  // element if unmount fires before the dynamic import() microtask resolves.
  it('does not construct Offcanvas after component unmounts during async init', async () => {
    const wrapper = mount(VibeOffcanvas, {
      props: { teleport: false }
    })

    // Unmount synchronously before the import() microtask resolves
    wrapper.unmount()

    // Drain microtask queue; isUnmounted guard must block the constructor
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.Offcanvas).not.toHaveBeenCalled()
  })
})
