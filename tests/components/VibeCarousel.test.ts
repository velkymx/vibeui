import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeCarousel from '../../src/components/VibeCarousel.vue'
import type { CarouselItem } from '../../src/types'

describe('VibeCarousel', () => {
  const mockItems: CarouselItem[] = [
    { src: '/img1.jpg', alt: 'Slide 1', active: true },
    { src: '/img2.jpg', alt: 'Slide 2', caption: 'Caption 2' },
    { src: '/img3.jpg', alt: 'Slide 3' }
  ]

  it('renders carousel with correct structure', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems
      }
    })

    expect(wrapper.find('.carousel').exists()).toBe(true)
    expect(wrapper.find('.carousel-inner').exists()).toBe(true)
    expect(wrapper.findAll('.carousel-item')).toHaveLength(3)
  })

  it('marks first item as active', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems
      }
    })

    const items = wrapper.findAll('.carousel-item')
    expect(items[0].classes()).toContain('active')
  })

  it('renders carousel images', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems
      }
    })

    const images = wrapper.findAll('img')
    expect(images).toHaveLength(3)
    expect(images[0].attributes('src')).toBe('/img1.jpg')
    expect(images[0].attributes('alt')).toBe('Slide 1')
  })

  it('renders controls by default', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems
      }
    })

    expect(wrapper.find('.carousel-control-prev').exists()).toBe(true)
    expect(wrapper.find('.carousel-control-next').exists()).toBe(true)
  })

  it('hides controls when controls prop is false', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems,
        controls: false
      }
    })

    expect(wrapper.find('.carousel-control-prev').exists()).toBe(false)
    expect(wrapper.find('.carousel-control-next').exists()).toBe(false)
  })

  it('renders indicators by default', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems
      }
    })

    expect(wrapper.find('.carousel-indicators').exists()).toBe(true)
    expect(wrapper.findAll('.carousel-indicators button')).toHaveLength(3)
  })

  it('hides indicators when indicators prop is false', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems,
        indicators: false
      }
    })

    expect(wrapper.find('.carousel-indicators').exists()).toBe(false)
  })

  it('renders caption when provided', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems
      }
    })

    expect(wrapper.text()).toContain('Caption 2')
  })

  it('applies fade class when fade prop is true', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems,
        fade: true
      }
    })

    expect(wrapper.find('.carousel').classes()).toContain('carousel-fade')
  })

  it('applies dark class when dark prop is true', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems,
        dark: true
      }
    })

    expect(wrapper.find('.carousel').classes()).toContain('carousel-dark')
  })

  it('sets data attributes correctly', () => {
    const wrapper = mount(VibeCarousel, {
      props: {
        id: 'test-carousel',
        items: mockItems,
        ride: 'carousel',
        interval: 3000,
        keyboard: false
      }
    })

    const carousel = wrapper.find('.carousel')
    expect(carousel.attributes('data-bs-ride')).toBe('carousel')
    expect(carousel.attributes('data-bs-interval')).toBe('3000')
    expect(carousel.attributes('data-bs-keyboard')).toBe('false')
  })
})
