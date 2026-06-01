import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeProgress from '../../src/components/VibeProgress.vue'
import type { ProgressBar } from '../../src/types'

describe('VibeProgress', () => {
  it('renders single progress bar', () => {
    const bars: ProgressBar[] = [{ value: 50 }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.find('.progress').exists()).toBe(true)
    expect(wrapper.findAll('.progress-bar')).toHaveLength(1)
  })

  it('renders multiple progress bars', () => {
    const bars: ProgressBar[] = [
      { value: 30, variant: 'success' },
      { value: 20, variant: 'warning' },
      { value: 15, variant: 'danger' }
    ]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.findAll('.progress-bar')).toHaveLength(3)
  })

  it('calculates width percentage correctly', () => {
    const bars: ProgressBar[] = [{ value: 75 }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    const progressBar = wrapper.find('.progress-bar')
    expect(progressBar.attributes('style')).toContain('width: 75%')
  })

  it('applies variant classes correctly', () => {
    const bars: ProgressBar[] = [{ value: 50, variant: 'success' }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.find('.progress-bar').classes()).toContain('bg-success')
  })

  it('applies striped class when striped is true', () => {
    const bars: ProgressBar[] = [{ value: 50, striped: true }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.find('.progress-bar').classes()).toContain('progress-bar-striped')
  })

  it('applies animated class when animated is true', () => {
    const bars: ProgressBar[] = [{ value: 50, animated: true }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    const progressBar = wrapper.find('.progress-bar')
    expect(progressBar.classes()).toContain('progress-bar-striped')
    expect(progressBar.classes()).toContain('progress-bar-animated')
  })

  it('displays custom label', () => {
    const bars: ProgressBar[] = [{ value: 50, label: 'Loading...' }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.find('.progress-bar').text()).toBe('Loading...')
  })

  it('displays percentage when showValue is true', () => {
    const bars: ProgressBar[] = [{ value: 75, showValue: true }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    expect(wrapper.find('.progress-bar').text()).toBe('75%')
  })

  it('uses custom max value', () => {
    const bars: ProgressBar[] = [{ value: 50, max: 200 }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    const progressBar = wrapper.find('.progress-bar')
    expect(progressBar.attributes('aria-valuemax')).toBe('200')
    // 50/200 = 25%
    expect(progressBar.attributes('style')).toContain('width: 25%')
  })

  it('sets custom height', () => {
    const bars: ProgressBar[] = [{ value: 50 }]

    const wrapper = mount(VibeProgress, {
      props: {
        bars,
        height: '30px'
      }
    })

    expect(wrapper.find('.progress').attributes('style')).toContain('height: 30px')
  })

  it('sets correct ARIA attributes', () => {
    const bars: ProgressBar[] = [{ value: 60 }]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    const progressBar = wrapper.find('.progress-bar')
    expect(progressBar.attributes('role')).toBe('progressbar')
    expect(progressBar.attributes('aria-valuenow')).toBe('60')
    expect(progressBar.attributes('aria-valuemin')).toBe('0')
    expect(progressBar.attributes('aria-valuemax')).toBe('100')
  })

  it('clamps values between 0 and 100', () => {
    const bars: ProgressBar[] = [
      { value: -10 },
      { value: 150 }
    ]

    const wrapper = mount(VibeProgress, {
      props: { bars }
    })

    const progressBars = wrapper.findAll('.progress-bar')
    expect(progressBars[0].attributes('style')).toContain('width: 0%')
    expect(progressBars[1].attributes('style')).toContain('width: 100%')
  })
})
