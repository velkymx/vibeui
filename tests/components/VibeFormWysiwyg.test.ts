import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'
import * as useBreakpointsModule from '../../src/composables/useBreakpoints'
import { ref } from 'vue'

// Mock useBreakpoints
vi.mock('../../src/composables/useBreakpoints', () => ({
  useBreakpoints: vi.fn(() => ({
    isMobile: ref(false),
    isXs: ref(false),
    isSm: ref(false),
    isMd: ref(false),
    isLg: ref(false),
    isXl: ref(false),
    isXxl: ref(false),
    isTablet: ref(false)
  }))
}))

describe('VibeFormWysiwyg', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(VibeFormWysiwyg)
    expect(wrapper.find('.vibe-wysiwyg-container').exists()).toBe(true)
  })

  it('supports custom mobile toolbar', async () => {
    const isMobile = ref(true)
    vi.mocked(useBreakpointsModule.useBreakpoints).mockReturnValue({
      isMobile,
      isXs: ref(false),
      isSm: ref(false),
      isMd: ref(false),
      isLg: ref(false),
      isXl: ref(false),
      isXxl: ref(false),
      isTablet: ref(false)
    })

    const customMobileToolbar = [['bold']]
    const wrapper = mount(VibeFormWysiwyg, {
      props: {
        mobileToolbar: customMobileToolbar
      }
    } as any) // ignore type error for now since prop doesn't exist yet

    expect(wrapper.props('mobileToolbar')).toEqual(customMobileToolbar)
  })
})
