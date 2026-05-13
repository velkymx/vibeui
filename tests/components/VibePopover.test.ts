import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibePopover from '../../src/components/VibePopover.vue'
import * as bootstrap from 'bootstrap'

describe('VibePopover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibePopover, {
      props: {
        title: 'Popover Title',
        content: 'Popover Content'
      },
      slots: {
        default: '<button>Click me</button>'
      }
    })

    expect(wrapper.find('[data-bs-toggle="popover"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Click me')
    expect(wrapper.find('[data-bs-toggle="popover"]').attributes('data-bs-title')).toBe('Popover Title')
    expect(wrapper.find('[data-bs-toggle="popover"]').attributes('data-bs-content')).toBe('Popover Content')
  })

  it('supports text prop as an alias for content', () => {
    const wrapper = mount(VibePopover, {
      props: {
        text: 'Popover Text'
      },
      slots: {
        default: '<button>Click me</button>'
      }
    })

    expect(wrapper.find('[data-bs-toggle="popover"]').attributes('data-bs-content')).toBe('Popover Text')
  })

  it('initializes bootstrap popover on mount', async () => {
    mount(VibePopover, {
      props: {
        content: 'Popover Content'
      },
      slots: {
        default: '<button>Click me</button>'
      }
    })

    // Wait for dynamic import and initialization
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(bootstrap.Popover).toHaveBeenCalled()
  })

  it('updates popover content when prop changes', async () => {
    const wrapper = mount(VibePopover, {
      props: {
        title: 'Initial Title',
        content: 'Initial Content'
      },
      slots: {
        default: '<button>Click me</button>'
      }
    })

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Popover).mock.results[0].value

    await wrapper.setProps({ content: 'Updated Content' })
    expect(mockInstance.setContent).toHaveBeenCalledWith({
      '.popover-header': 'Initial Title',
      '.popover-body': 'Updated Content'
    })
  })

  it('never passes html:true to Bootstrap regardless of content', async () => {
    mount(VibePopover, {
      props: { content: '<b>bold</b>' },
      slots: { default: '<button>x</button>' }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Popover).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.not.objectContaining({ html: true })
    )
  })

  it('does not set data-bs-html attribute on element', () => {
    const wrapper = mount(VibePopover, {
      props: { content: 'Safe content' },
      slots: { default: '<button>x</button>' }
    })
    expect(wrapper.find('[data-bs-toggle="popover"]').attributes('data-bs-html')).toBeUndefined()
  })

  it('cleans up bootstrap popover on unmount', async () => {
    const wrapper = mount(VibePopover, {
      props: {
        content: 'Popover Content'
      },
      slots: {
        default: '<button>Click me</button>'
      }
    })

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Popover).mock.results[0].value

    wrapper.unmount()
    expect(mockInstance.dispose).toHaveBeenCalled()
  })
})
