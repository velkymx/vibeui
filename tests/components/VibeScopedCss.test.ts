import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import VibeFormInput from '../../src/components/VibeFormInput.vue'
import VibeFormTextarea from '../../src/components/VibeFormTextarea.vue'

// #155: internal computed presentation lives in the scoped stylesheet (reactive
// v-bind() / state classes) instead of per-render inline :style objects.
// (The vitest pipeline does not compile <style> blocks, so the v-bind wiring
// itself is asserted at source level; behavior is asserted on the DOM.)
describe('internal styles in scoped CSS (#155)', () => {
  const inputSource = readFileSync('src/components/VibeFormInput.vue', 'utf8')

  it('strength color rides a reactive stylesheet binding, not per-bar inline styles', () => {
    expect(inputSource).toContain('background-color: v-bind(activeStrengthColor)')
    expect(inputSource).not.toContain('backgroundColor')
  })

  it('strength bars use an active class with no inline background', async () => {
    const wrapper = mount(VibeFormInput, {
      props: { id: 'pw', type: 'password', showPasswordStrength: true, modelValue: 'Str0ng!Passw0rd' },
    })
    const bars = wrapper.findAll('.vibe-strength-bar')
    expect(bars).toHaveLength(4)
    // Strong password lights all four bars.
    expect(wrapper.findAll('.vibe-strength-active')).toHaveLength(4)
    // No per-bar inline background remains.
    for (const bar of bars) {
      expect(bar.attributes('style') ?? '').not.toContain('background')
    }
  })

  it('textarea no-resize is a state class, not an inline style', () => {
    const wrapper = mount(VibeFormTextarea, { props: { id: 'ta', noResize: true } })
    const area = wrapper.find('textarea')
    expect(area.classes()).toContain('vibe-textarea-no-resize')
    expect(area.attributes('style')).toBeUndefined()
  })
})
