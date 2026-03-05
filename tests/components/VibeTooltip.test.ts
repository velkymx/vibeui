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

    expect(wrapper.find('[data-bs-toggle="tooltip"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Hover me')
    expect(wrapper.find('[data-bs-toggle="tooltip"]').attributes('data-bs-title')).toBe('Tooltip Content')
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

    expect(wrapper.find('[data-bs-toggle="tooltip"]').attributes('data-bs-title')).toBe('Tooltip Text')
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
})
