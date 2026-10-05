import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeProgress from '../../src/components/VibeProgress.vue'

// #137: height accepts a number (treated as px), consistent with the chart
// components, in addition to the existing string form.

describe('VibeProgress height (#137)', () => {
  it('treats a numeric height as pixels', () => {
    const wrapper = mount(VibeProgress, { props: { height: 6, bars: [{ value: 50 }] } })
    expect((wrapper.find('.progress').element as HTMLElement).style.height).toBe('6px')
  })

  it('passes a string height through', () => {
    const wrapper = mount(VibeProgress, { props: { height: '2rem', bars: [{ value: 50 }] } })
    expect((wrapper.find('.progress').element as HTMLElement).style.height).toBe('2rem')
  })

  it('ignores an unsafe height value', () => {
    const wrapper = mount(VibeProgress, { props: { height: 'url(x)', bars: [{ value: 50 }] } })
    expect((wrapper.find('.progress').element as HTMLElement).style.height).toBe('')
  })
})
