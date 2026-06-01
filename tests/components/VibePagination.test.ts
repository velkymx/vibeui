import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibePagination from '../../src/components/VibePagination.vue'

describe('VibePagination', () => {
  it('renders correct number of pages', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1
      }
    })

    // 5 pages + prev + next
    expect(wrapper.findAll('.page-item')).toHaveLength(7)
  })

  it('renders with custom size', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1,
        size: 'sm'
      }
    })

    expect(wrapper.find('.pagination').classes()).toContain('pagination-sm')
  })

  it('marks current page as active', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 3
      }
    })

    const pageItems = wrapper.findAll('.page-item')
    // Skip prev button (index 0), page 3 is at index 3
    expect(pageItems[3].classes()).toContain('active')
  })

  it('emits update:currentPage when page is clicked', async () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1
      }
    })

    const pageLinks = wrapper.findAll('.page-link')
    await pageLinks[2].trigger('click') // Click page 2 (index 2 = prev + page 1)

    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    const emitted = wrapper.emitted('update:currentPage') as any[][]
    expect(emitted[0][0]).toBe(2)
  })

  it('emits page-click event', async () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1
      }
    })

    const pageLinks = wrapper.findAll('.page-link')
    await pageLinks[2].trigger('click')

    expect(wrapper.emitted('page-click')).toBeTruthy()
    const emitted = wrapper.emitted('page-click') as any[][]
    expect(emitted[0][0]).toBe(2)
  })

  it('disables prev button on first page', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1
      }
    })

    const prevButton = wrapper.findAll('.page-item')[0]
    expect(prevButton.classes()).toContain('disabled')
  })

  it('disables next button on last page', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 5
      }
    })

    const pageItems = wrapper.findAll('.page-item')
    const nextButton = pageItems[pageItems.length - 1]
    expect(nextButton.classes()).toContain('disabled')
  })

  it('hides prev/next buttons when showPrevNext is false', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1,
        showPrevNext: false
      }
    })

    // Only page numbers, no prev/next
    expect(wrapper.findAll('.page-item')).toHaveLength(5)
  })

  it('uses custom prev/next text', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1,
        prevText: 'Anterior',
        nextText: 'Siguiente'
      }
    })

    expect(wrapper.text()).toContain('Anterior')
    expect(wrapper.text()).toContain('Siguiente')
  })

  it('handles next button click', async () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1
      }
    })

    const pageLinks = wrapper.findAll('.page-link')
    const nextButton = pageLinks[pageLinks.length - 1]
    await nextButton.trigger('click')

    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    const emitted = wrapper.emitted('update:currentPage') as any[][]
    expect(emitted[0][0]).toBe(2)
  })

  it('handles prev button click', async () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 3
      }
    })

    const prevButton = wrapper.findAll('.page-link')[0]
    await prevButton.trigger('click')

    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    const emitted = wrapper.emitted('update:currentPage') as any[][]
    expect(emitted[0][0]).toBe(2)
  })

  it('sets correct aria-label', () => {
    const wrapper = mount(VibePagination, {
      props: {
        totalPages: 5,
        currentPage: 1,
        ariaLabel: 'Custom pagination'
      }
    })

    expect(wrapper.find('nav').attributes('aria-label')).toBe('Custom pagination')
  })
})
