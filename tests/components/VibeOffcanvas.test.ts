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

    // Simulating the event that sets isVisible internal state
    const offcanvasEl = wrapper.find('.offcanvas').element
    offcanvasEl.dispatchEvent(new Event('show.bs.offcanvas'))

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.hide).toHaveBeenCalled()
  })
})
