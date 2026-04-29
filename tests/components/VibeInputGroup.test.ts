import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeInputGroup from '../../src/components/VibeInputGroup.vue'
import VibeFormInput from '../../src/components/VibeFormInput.vue'

describe('VibeInputGroup', () => {
  it('renders correctly with base class', () => {
    const wrapper = mount(VibeInputGroup)
    expect(wrapper.classes()).toContain('input-group')
  })

  it('applies size class', () => {
    const wrapper = mount(VibeInputGroup, {
      props: { size: 'lg' }
    })
    expect(wrapper.classes()).toContain('input-group-lg')
  })

  it('renders prepend and append text via props', () => {
    const wrapper = mount(VibeInputGroup, {
      props: {
        prepend: '@',
        append: '.00'
      }
    })
    const texts = wrapper.findAll('.input-group-text')
    expect(texts).toHaveLength(2)
    expect(texts[0].text()).toBe('@')
    expect(texts[1].text()).toBe('.00')
  })

  it('integrates with VibeFormInput using noWrapper', () => {
    const wrapper = mount(VibeInputGroup, {
      slots: {
        default: '<VibeFormInput noWrapper modelValue="test" />'
      },
      global: {
        components: { VibeFormInput }
      }
    })

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').classes()).toContain('form-control')
    // Ensure no wrapper div is present around the input
    expect(wrapper.find('.mb-3').exists()).toBe(false)
  })

  describe('rich prepend/append slots (icon + button combos)', () => {
    it('renders icon span via prepend slot', () => {
      const wrapper = mount(VibeInputGroup, {
        slots: {
          prepend: '<span class="input-group-text"><i class="bi bi-at"></i></span>',
          default: '<input class="form-control" />'
        }
      })

      const prepend = wrapper.find('.input-group-text')
      expect(prepend.exists()).toBe(true)
      expect(prepend.find('i.bi-at').exists()).toBe(true)
      expect(wrapper.find('input.form-control').exists()).toBe(true)
    })

    it('renders button via append slot alongside form-control', () => {
      const wrapper = mount(VibeInputGroup, {
        slots: {
          default: '<input class="form-control" />',
          append: '<button class="btn btn-primary" type="button">Send</button>'
        }
      })

      const root = wrapper.element
      const children = Array.from(root.children)
      expect(children).toHaveLength(2)
      expect(children[0].classList.contains('form-control')).toBe(true)
      expect(children[1].classList.contains('btn-primary')).toBe(true)
      expect(children[1].textContent).toBe('Send')
    })

    it('icon-prepend + control + button-append (CommentSection composer pattern)', () => {
      const wrapper = mount(VibeInputGroup, {
        slots: {
          prepend: '<span class="input-group-text"><i class="bi bi-chat"></i></span>',
          default: '<input class="form-control" placeholder="Comment..." />',
          append: '<button class="btn btn-primary" type="button">Post</button>'
        }
      })

      const children = Array.from(wrapper.element.children)
      expect(children).toHaveLength(3)
      expect(children[0].classList.contains('input-group-text')).toBe(true)
      expect(children[0].querySelector('i.bi-chat')).not.toBeNull()
      expect(children[1].classList.contains('form-control')).toBe(true)
      expect(children[2].classList.contains('btn-primary')).toBe(true)
      expect(wrapper.classes()).toContain('input-group')
    })

    it('slot wins over prop when both prepend slot and prepend prop provided', () => {
      const wrapper = mount(VibeInputGroup, {
        props: { prepend: 'fallback' },
        slots: {
          prepend: '<span class="input-group-text from-slot">slot</span>'
        }
      })

      expect(wrapper.find('.from-slot').exists()).toBe(true)
      expect(wrapper.text()).not.toContain('fallback')
    })

    it('preserves DOM order: prepend → default → append', () => {
      const wrapper = mount(VibeInputGroup, {
        slots: {
          prepend: '<span class="input-group-text" data-pos="1">P</span>',
          default: '<input class="form-control" data-pos="2" />',
          append: '<button class="btn btn-secondary" data-pos="3" type="button">A</button>'
        }
      })

      const positions = Array.from(wrapper.element.children).map(
        c => (c as HTMLElement).dataset.pos
      )
      expect(positions).toEqual(['1', '2', '3'])
    })
  })
})
