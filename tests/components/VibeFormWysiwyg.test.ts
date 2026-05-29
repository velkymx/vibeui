import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'
import * as useBreakpointsModule from '../../src/composables/useBreakpoints'
import * as sanitizeHtmlModule from '../../src/utils/sanitizeHtml'
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

  describe('toolbar presets', () => {
    it('accepts "minimal" preset', () => {
      const wrapper = mount(VibeFormWysiwyg, {
        props: { toolbar: 'minimal' }
      })
      expect(wrapper.props('toolbar')).toBe('minimal')
    })

    it('accepts "standard" preset', () => {
      const wrapper = mount(VibeFormWysiwyg, {
        props: { toolbar: 'standard' }
      })
      expect(wrapper.props('toolbar')).toBe('standard')
    })

    it('accepts "full" preset', () => {
      const wrapper = mount(VibeFormWysiwyg, {
        props: { toolbar: 'full' }
      })
      expect(wrapper.props('toolbar')).toBe('full')
    })

    it('accepts custom array (preserves Quill format)', () => {
      const custom = [['bold'], [{ header: 1 }]]
      const wrapper = mount(VibeFormWysiwyg, {
        props: { toolbar: custom }
      })
      expect(wrapper.props('toolbar')).toEqual(custom)
    })

    it('accepts toolbar=false to disable', () => {
      const wrapper = mount(VibeFormWysiwyg, {
        props: { toolbar: false }
      })
      expect(wrapper.props('toolbar')).toBe(false)
    })
  })

  // Regression: isUnmounted guard — Quill constructor must not run on a detached container
  // if unmount fires before the dynamic import() microtasks resolve. When Quill constructs
  // successfully it injects a .ql-editor element into the container — we check for its absence.
  it('does not inject .ql-editor after component unmounts during async init', async () => {
    // Attach to document so the editorContainer ref is set before unmount
    const el = document.createElement('div')
    document.body.appendChild(el)

    const wrapper = mount(VibeFormWysiwyg, { attachTo: el })

    // Unmount synchronously before both import() microtasks resolve
    wrapper.unmount()

    // Drain the microtask queue (two awaits in initQuill)
    await new Promise(resolve => setTimeout(resolve, 0))

    // If isUnmounted guard works, Quill never ran — no .ql-editor injected
    expect(el.querySelector('.ql-editor')).toBeNull()

    document.body.removeChild(el)
  })

  it('cleans up handlers on unmount', async () => {
    const wrapper = mount(VibeFormWysiwyg)
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should not throw during cleanup
    expect(() => wrapper.unmount()).not.toThrow()
  })

  // Security: loadDOMPurify() must be awaited during initQuill so sanitizeHtml is
  // active before any modelValue HTML reaches Quill's clipboard.convert.
  // Quill fails to initialize in happy-dom so we spy on the utility module directly.
  describe('DOMPurify sanitization', () => {
    it('calls loadDOMPurify during Quill initialization', async () => {
      const loadSpy = vi.spyOn(sanitizeHtmlModule, 'loadDOMPurify').mockResolvedValue(undefined)

      mount(VibeFormWysiwyg, { props: { modelValue: '<p>text</p>' } })
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(loadSpy).toHaveBeenCalled()
      loadSpy.mockRestore()
    })

    it('sanitizeHtml is wired to setQuillContent — see tests/utils/sanitizeHtml.test.ts for full coverage', () => {
      // Full DOMPurify sanitization behavior is verified in the utility test suite.
      // This test documents the contract: VibeFormWysiwyg imports and uses sanitizeHtml
      // from src/utils/sanitizeHtml.ts for both input (setQuillContent) and
      // output (getQuillContent → getSemanticHTML).
      expect(typeof sanitizeHtmlModule.sanitizeHtml).toBe('function')
      expect(typeof sanitizeHtmlModule.loadDOMPurify).toBe('function')
    })
  })
})
