import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeModal from '../../src/components/VibeModal.vue'
import * as bootstrap from 'bootstrap'

describe('VibeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeModal, {
      props: {
        title: 'Modal Title',
        teleport: false
      },
      slots: {
        default: 'Modal Body Content'
      }
    })

    expect(wrapper.find('.modal-title').text()).toBe('Modal Title')
    expect(wrapper.find('.modal-body').text()).toBe('Modal Body Content')
  })

  it('applies centered class', () => {
    const wrapper = mount(VibeModal, {
      props: {
        centered: true,
        teleport: false
      }
    })

    expect(wrapper.find('.modal-dialog-centered').exists()).toBe(true)
  })

  it('applies fullscreen class', () => {
    const wrapper = mount(VibeModal, {
      props: {
        fullscreen: true,
        teleport: false
      }
    })

    expect(wrapper.find('.modal-fullscreen').exists()).toBe(true)
  })
})
