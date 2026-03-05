import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeCarousel from '../../src/components/VibeCarousel.vue'
import * as bootstrap from 'bootstrap'

describe('VibeCarousel', () => {
  const mockItems = [
    { src: 'image1.jpg', caption: 'Caption 1' },
    { src: 'image2.jpg', caption: 'Caption 2' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems
      }
    })

    expect(wrapper.find('.carousel').exists()).toBe(true)
    expect(wrapper.findAll('.carousel-item')).toHaveLength(2)
  })

  it('initializes bootstrap carousel on mount', async () => {
    mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bootstrap.Carousel).toHaveBeenCalled()
  })

  it('calls to(index) when modelValue changes', async () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems,
        modelValue: 0
      }
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    const mockInstance = vi.mocked(bootstrap.Carousel).mock.results[0].value

    await wrapper.setProps({ modelValue: 1 })
    expect(mockInstance.to).toHaveBeenCalledWith(1)
  })
})
