import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeCard from '../../src/components/VibeCard.vue'

describe('VibeCard', () => {
  it('renders card with correct structure', () => {
    const wrapper = mount(VibeCard)

    expect(wrapper.find('.card').exists()).toBe(true)
  })

  it('renders title when provided', () => {
    const wrapper = mount(VibeCard, {
      props: {
        title: 'Test Title'
      }
    })

    expect(wrapper.find('.card-title').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Title')
  })

  it('renders body when provided', () => {
    const wrapper = mount(VibeCard, {
      props: {
        body: 'Test body content'
      }
    })

    expect(wrapper.find('.card-text').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test body content')
  })

  it('renders header when provided', () => {
    const wrapper = mount(VibeCard, {
      props: {
        header: 'Test Header'
      }
    })

    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Header')
  })

  it('renders footer when provided', () => {
    const wrapper = mount(VibeCard, {
      props: {
        footer: 'Test Footer'
      }
    })

    expect(wrapper.find('.card-footer').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Footer')
  })

  it('renders top image when provided', () => {
    const wrapper = mount(VibeCard, {
      props: {
        imgSrc: '/test.jpg',
        imgAlt: 'Test image',
        imgTop: true
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.classes()).toContain('card-img-top')
    expect(img.attributes('src')).toBe('/test.jpg')
    expect(img.attributes('alt')).toBe('Test image')
  })

  it('renders bottom image when imgBottom is true', () => {
    const wrapper = mount(VibeCard, {
      props: {
        imgSrc: '/test.jpg',
        imgTop: false,
        imgBottom: true
      }
    })

    const img = wrapper.find('img')
    expect(img.classes()).toContain('card-img-bottom')
  })

  it('applies variant class', () => {
    const wrapper = mount(VibeCard, {
      props: {
        variant: 'primary'
      }
    })

    expect(wrapper.find('.card').classes()).toContain('bg-primary')
  })

  it('applies border class', () => {
    const wrapper = mount(VibeCard, {
      props: {
        border: 'danger'
      }
    })

    expect(wrapper.find('.card').classes()).toContain('border-danger')
  })

  it('applies text variant class', () => {
    const wrapper = mount(VibeCard, {
      props: {
        textVariant: 'white'
      }
    })

    expect(wrapper.find('.card').classes()).toContain('text-white')
  })

  it('renders with custom tag', () => {
    const wrapper = mount(VibeCard, {
      props: {
        tag: 'section'
      }
    })

    expect(wrapper.find('section.card').exists()).toBe(true)
  })

  it('renders all sections together', () => {
    const wrapper = mount(VibeCard, {
      props: {
        header: 'Header',
        title: 'Title',
        body: 'Body',
        footer: 'Footer'
      }
    })

    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.find('.card-title').exists()).toBe(true)
    expect(wrapper.find('.card-text').exists()).toBe(true)
    expect(wrapper.find('.card-footer').exists()).toBe(true)
  })
})
