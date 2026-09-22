import { describe, it, expect } from 'vitest'
import { defineComponent, h, inject } from 'vue'
import { mount } from '@vue/test-utils'
import VibeUIPlugin from '../../src/components'
import { VIBE_WYSIWYG_KEY } from '../../src/composables/wysiwygConfig'

describe('VibeUI plugin options', () => {
  it('provides the injected wysiwyg config to descendants', () => {
    let seen: unknown = 'unset'
    const Probe = defineComponent({
      setup() { seen = inject(VIBE_WYSIWYG_KEY, null); return () => h('div') }
    })
    const loader = () => Promise.resolve({})
    mount(Probe, {
      global: { plugins: [[VibeUIPlugin, { wysiwyg: { quillLoader: loader } }]] }
    })
    expect(seen).toEqual({ quillLoader: loader })
  })

  it('provides nothing when no options are passed', () => {
    let seen: unknown = 'unset'
    const Probe = defineComponent({
      setup() { seen = inject(VIBE_WYSIWYG_KEY, null); return () => h('div') }
    })
    mount(Probe, { global: { plugins: [VibeUIPlugin] } })
    expect(seen).toBeNull()
  })
})
