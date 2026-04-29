import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeSkeleton from '../../src/components/VibeSkeleton.vue'

describe('VibeSkeleton', () => {
  describe('text variant', () => {
    it('renders single text line by default', () => {
      const wrapper = mount(VibeSkeleton)
      const lines = wrapper.findAll('.vibe-skeleton')
      expect(lines).toHaveLength(1)
      expect(lines[0].classes()).toContain('vibe-skeleton-text')
    })

    it('renders N lines when lines prop is set', () => {
      const wrapper = mount(VibeSkeleton, { props: { lines: 3 } })
      const lines = wrapper.findAll('.vibe-skeleton-text')
      expect(lines).toHaveLength(3)
    })

    it('last line is shorter when lines > 1', () => {
      const wrapper = mount(VibeSkeleton, { props: { lines: 3 } })
      const lines = wrapper.findAll('.vibe-skeleton-text')
      expect(lines[lines.length - 1].classes()).toContain('vibe-skeleton-text-last')
    })
  })

  describe('rect variant', () => {
    it('applies rect class', () => {
      const wrapper = mount(VibeSkeleton, { props: { variant: 'rect' } })
      expect(wrapper.find('.vibe-skeleton').classes()).toContain('vibe-skeleton-rect')
    })

    it('applies width and height styles', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'rect', width: '200px', height: '120px' }
      })
      const el = wrapper.find('.vibe-skeleton').element as HTMLElement
      expect(el.style.width).toBe('200px')
      expect(el.style.height).toBe('120px')
    })

    it('numeric width/height becomes pixels', () => {
      const wrapper = mount(VibeSkeleton, {
        props: { variant: 'rect', width: 200, height: 100 }
      })
      const el = wrapper.find('.vibe-skeleton').element as HTMLElement
      expect(el.style.width).toBe('200px')
      expect(el.style.height).toBe('100px')
    })
  })

  describe('circle variant', () => {
    it('applies circle class', () => {
      const wrapper = mount(VibeSkeleton, { props: { variant: 'circle' } })
      expect(wrapper.find('.vibe-skeleton').classes()).toContain('vibe-skeleton-circle')
    })

    it('a circle with width sets height to match (1:1)', () => {
      const wrapper = mount(VibeSkeleton, { props: { variant: 'circle', width: 64 } })
      const el = wrapper.find('.vibe-skeleton').element as HTMLElement
      expect(el.style.width).toBe('64px')
      expect(el.style.height).toBe('64px')
    })
  })

  describe('card variant', () => {
    it('renders a structured card skeleton (image + lines)', () => {
      const wrapper = mount(VibeSkeleton, { props: { variant: 'card' } })
      expect(wrapper.find('.vibe-skeleton-card').exists()).toBe(true)
      expect(wrapper.find('.vibe-skeleton-rect').exists()).toBe(true)
      expect(wrapper.findAll('.vibe-skeleton-text').length).toBeGreaterThan(0)
    })
  })

  describe('animation', () => {
    it('animated by default', () => {
      const wrapper = mount(VibeSkeleton)
      expect(wrapper.find('.vibe-skeleton').classes()).toContain('vibe-skeleton-animated')
    })

    it('animated=false drops the animation class', () => {
      const wrapper = mount(VibeSkeleton, { props: { animated: false } })
      expect(wrapper.find('.vibe-skeleton').classes()).not.toContain('vibe-skeleton-animated')
    })
  })

  describe('accessibility', () => {
    it('has aria-busy and role=status', () => {
      const wrapper = mount(VibeSkeleton)
      const el = wrapper.find('.vibe-skeleton').element
      expect(el.getAttribute('aria-busy')).toBe('true')
      expect(el.getAttribute('role')).toBe('status')
    })
  })
})
