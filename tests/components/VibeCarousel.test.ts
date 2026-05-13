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

  it('does not stack event listeners on items re-init', async () => {
    const wrapper = mount(VibeCarousel, {
      props: { id: 'test-carousel', items: mockItems }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    await wrapper.setProps({ items: [...mockItems, { src: 'image3.jpg' }] })
    await new Promise(resolve => setTimeout(resolve, 0))

    wrapper.find('.carousel').element.dispatchEvent(
      Object.assign(new Event('slid.bs.carousel'), { from: 0, to: 1, direction: 'left' })
    )

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toHaveLength(1)
    expect(emitted![0]).toEqual([1])
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
