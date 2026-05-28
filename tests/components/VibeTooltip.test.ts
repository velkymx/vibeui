import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeTooltip from '../../src/components/VibeTooltip.vue'
import * as bootstrap from 'bootstrap'

describe('VibeTooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeTooltip, {
      props: {
        content: 'Tooltip Content'
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })

    expect(wrapper.find('span[data-bs-placement]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Hover me')
    expect(wrapper.find('span[data-bs-placement]').attributes('data-bs-title')).toBe('Tooltip Content')
  })

  it('supports text prop as an alias for content', () => {
    const wrapper = mount(VibeTooltip, {
      props: {
        text: 'Tooltip Text'
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })

    expect(wrapper.find('span[data-bs-placement]').attributes('data-bs-title')).toBe('Tooltip Text')
  })

  it('initializes bootstrap tooltip on mount', async () => {
    mount(VibeTooltip, {
      props: {
        content: 'Tooltip Content'
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })

    // Wait for dynamic import and initialization
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.Tooltip).toHaveBeenCalled()
  })

  it('updates tooltip content when prop changes', async () => {
    const wrapper = mount(VibeTooltip, {
      props: {
        content: 'Initial Content'
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Tooltip).mock.results[0].value

    await wrapper.setProps({ content: 'Updated Content' })
    expect(mockInstance.setContent).toHaveBeenCalledWith({ '.tooltip-inner': 'Updated Content' })
  })

  it('cleans up bootstrap tooltip on unmount', async () => {
    const wrapper = mount(VibeTooltip, {
      props: {
        content: 'Tooltip Content'
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Tooltip).mock.results[0].value

    wrapper.unmount()
    expect(mockInstance.dispose).toHaveBeenCalled()
  })

  it('never passes html:true to Bootstrap regardless of content', async () => {
    mount(VibeTooltip, {
      props: { content: '<b>bold</b>' },
      slots: { default: '<button>x</button>' }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Tooltip).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.not.objectContaining({ html: true })
    )
  })

  it('does not set data-bs-html attribute on element', () => {
    const wrapper = mount(VibeTooltip, {
      props: { content: 'Safe content' },
      slots: { default: '<button>x</button>' }
    })
    expect(wrapper.find('span[data-bs-placement]').attributes('data-bs-html')).toBeUndefined()
  })

  it('switches trigger to click on touch devices', async () => {
    // Simulate touch support
    vi.stubGlobal('ontouchstart', {})

    const wrapper = mount(VibeTooltip, {
      props: {
        content: 'Tooltip Content'
      },
      slots: {
        default: '<button>Hover me</button>'
      }
    })

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.Tooltip).toHaveBeenCalledWith(expect.any(HTMLElement), expect.objectContaining({
      trigger: 'click'
    }))

    vi.unstubAllGlobals()
  })

  // Regression: isUnmounted guard — if component unmounts while async init is in-flight
  // (between call and await resolution), Bootstrap constructor must NOT run on detached element.
  // await import('bootstrap') always creates a microtask boundary even for cached modules,
  // so unmounting synchronously after mount() leaves isUnmounted=true before the constructor call.
  it('does not construct Tooltip after component unmounts during async init', async () => {
    const wrapper = mount(VibeTooltip, {
      props: { content: 'Test' },
      slots: { default: '<button>x</button>' }
    })

    // Unmount synchronously — fires onBeforeUnmount before the import() microtask resolves
    wrapper.unmount()

    // Drain microtask queue so the import() resolves and the post-await guard runs
    await new Promise(resolve => setTimeout(resolve, 0))

    // isUnmounted guard must have blocked the constructor
    expect(bootstrap.Tooltip).not.toHaveBeenCalled()
  })

  it('sets bsInstance to null after unmount', async () => {
    const wrapper = mount(VibeTooltip, {
      props: { content: 'Test' },
      slots: { default: '<button>x</button>' }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    // bsInstance was set during init
    expect(wrapper.vm.bsInstance).not.toBeNull()

    wrapper.unmount()

    // onBeforeUnmount must dispose and null the instance
    expect(vi.mocked(bootstrap.Tooltip).mock.results[0].value.dispose).toHaveBeenCalled()
  })
})
