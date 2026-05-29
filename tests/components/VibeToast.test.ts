import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeToast from '../../src/components/VibeToast.vue'
import * as bootstrap from 'bootstrap'

describe('VibeToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeToast, {
      props: {
        title: 'Toast Title',
        teleport: false
      },
      slots: {
        default: 'Toast Body'
      }
    })

    expect(wrapper.find('.toast').exists()).toBe(true)
    expect(wrapper.find('.toast-header').text()).toContain('Toast Title')
    expect(wrapper.find('.toast-body').text()).toBe('Toast Body')
  })

  it('initializes bootstrap toast on mount', async () => {
    mount(VibeToast, {
      props: {
        id: 'test-toast',
        teleport: false
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Toast).toHaveBeenCalled()
  })

  it('shows when modelValue is true on mount', async () => {
    mount(VibeToast, {
      props: {
        modelValue: true,
        teleport: false
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Toast).mock.results[0].value
    expect(mockInstance.show).toHaveBeenCalled()
  })

  it('does not stack event listeners on re-init (delay change)', async () => {
    const wrapper = mount(VibeToast, {
      props: { delay: 3000, teleport: false }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    await wrapper.setProps({ delay: 5000 })
    await new Promise(resolve => setTimeout(resolve, 0))

    wrapper.find('.toast').element.dispatchEvent(new Event('shown.bs.toast'))

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual([true])
  })

  it('toggles when modelValue changes', async () => {
    const wrapper = mount(VibeToast, {
      props: {
        modelValue: false,
        teleport: false
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Toast).mock.results[0].value

    await wrapper.setProps({ modelValue: true })
    expect(mockInstance.show).toHaveBeenCalled()

    // Simulate shown event (sets isVisible=true so the hide guard works correctly)
    wrapper.find('.toast').element.dispatchEvent(new Event('shown.bs.toast'))

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.hide).toHaveBeenCalled()
  })

  // Regression: watcher called bsToast.hide() even when isVisible was already false.
  // When autohide fires: hidden.bs.toast → isVisible=false → emit update:modelValue=false
  // → watcher fires → hide() called again → another hidden event → event storm.
  it('does not call hide() when modelValue becomes false but toast is already hidden', async () => {
    const wrapper = mount(VibeToast, {
      props: { modelValue: true, teleport: false }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Toast).mock.results[0].value

    // Simulate autohide: Bootstrap fires 'shown' then 'hidden' (isVisible flips false)
    const toastEl = wrapper.find('.toast').element
    toastEl.dispatchEvent(new Event('shown.bs.toast'))
    toastEl.dispatchEvent(new Event('hidden.bs.toast'))

    // Now isVisible is false; simulate the delayed v-model update arriving
    mockInstance.hide.mockClear()
    await wrapper.setProps({ modelValue: false })

    // hide() must NOT be called — toast is already hidden, would cause event storm
    expect(mockInstance.hide).not.toHaveBeenCalled()
  })
})
