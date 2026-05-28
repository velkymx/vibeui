import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeScrollspy from '../../src/components/VibeScrollspy.vue'
import * as bootstrap from 'bootstrap'

describe('VibeScrollspy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeScrollspy, {
      props: { target: '#nav' }
    })
    expect(wrapper.find('[data-bs-spy="scroll"]').exists()).toBe(true)
    expect(wrapper.find('[data-bs-target="#nav"]').exists()).toBe(true)
  })

  it('initializes Bootstrap ScrollSpy on mount', async () => {
    mount(VibeScrollspy, { props: { target: '#nav' } })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.ScrollSpy).toHaveBeenCalled()
  })

  it('cleans up on unmount', async () => {
    const wrapper = mount(VibeScrollspy, { props: { target: '#nav' } })
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.ScrollSpy).mock.results[0].value

    wrapper.unmount()
    expect(mockInstance.dispose).toHaveBeenCalled()
  })

  // Regression: isUnmounted guard — ScrollSpy constructor must not run after unmount.
  it('does not construct ScrollSpy after component unmounts during async init', async () => {
    const wrapper = mount(VibeScrollspy, { props: { target: '#nav' } })

    wrapper.unmount()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.ScrollSpy).not.toHaveBeenCalled()
  })
})
