import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeCollapse from '../../src/components/VibeCollapse.vue'
import * as bootstrap from 'bootstrap'

describe('VibeCollapse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeCollapse, {
      props: {
        id: 'test-collapse'
      },
      slots: {
        default: 'Content'
      }
    })

    expect(wrapper.find('.collapse').exists()).toBe(true)
    expect(wrapper.text()).toBe('Content')
  })

  it('initializes bootstrap collapse on mount', async () => {
    mount(VibeCollapse, {
      props: {
        id: 'test-collapse'
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Collapse).toHaveBeenCalled()
  })

  it('shows when modelValue is true on mount', async () => {
    mount(VibeCollapse, {
      props: {
        id: 'test-collapse',
        modelValue: true
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Collapse).mock.results[0].value
    expect(mockInstance.show).toHaveBeenCalled()
  })

  it('with modelValue=true on mount, changing to false triggers hide', async () => {
    const wrapper = mount(VibeCollapse, {
      props: { id: 'test-collapse', modelValue: true }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Collapse).mock.results[0].value

    // Simulate Bootstrap dispatching 'show.bs.collapse' (from show() call)
    wrapper.find('.collapse').element.dispatchEvent(new Event('show.bs.collapse'))

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.hide).toHaveBeenCalled()
  })

  // CR8-2: isUnmounted guard — Bootstrap.Collapse must not be constructed if the
  // component unmounts while the async `import('bootstrap')` is in flight.
  // Without an explicit isUnmounted flag, the only guard is `if (!collapseRef.value)`,
  // which is set to null by Vue *after* onBeforeUnmount runs — there is a window where
  // collapseRef is still set but the DOM is already detached.
  it('does not construct Bootstrap.Collapse when the component unmounts during async init', async () => {
    vi.clearAllMocks()

    const el = document.createElement('div')
    document.body.appendChild(el)

    // Mount then immediately unmount — before the import() microtask resolves
    const wrapper = mount(VibeCollapse, {
      props: { id: 'unmount-race' },
      attachTo: el
    })
    wrapper.unmount()

    // Drain all pending microtasks so the async onMounted continuation runs
    await new Promise(resolve => setTimeout(resolve, 0))

    // With isUnmounted guard: constructor never fires
    expect(bootstrap.Collapse).not.toHaveBeenCalled()

    document.body.removeChild(el)
  })

  it('toggles when modelValue changes', async () => {
    const wrapper = mount(VibeCollapse, {
      props: {
        id: 'test-collapse',
        modelValue: false
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Collapse).mock.results[0].value

    await wrapper.setProps({ modelValue: true })
    expect(mockInstance.show).toHaveBeenCalled()

    // Simulate show event
    wrapper.find('.collapse').element.dispatchEvent(new Event('show.bs.collapse'))

    await wrapper.setProps({ modelValue: false })
    expect(mockInstance.hide).toHaveBeenCalled()
  })
})
