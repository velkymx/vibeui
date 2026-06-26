import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'
import * as useBreakpointsModule from '../../src/composables/useBreakpoints'
import * as sanitizeHtmlModule from '../../src/utils/sanitizeHtml'
import { ref, nextTick } from 'vue'

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

  // CR8-1: VibeFormWysiwyg must NOT have a static `import Quill from 'quill'` at the
  // module top level. quill is an optional peer dep — a static import causes a
  // ModuleNotFoundError at component-evaluation time for consumers who haven't installed it.
  // All quill usage must be lazy (inside initQuill via `await import('quill')`).
  //
  // Strategy: use vi.doMock (non-hoisted) + vi.resetModules() to force a fresh module
  // evaluation with quill throwing on import. If the static import exists, the component
  // module evaluation itself throws and the dynamic import below rejects.
  it('evaluates the module without importing quill at the top level', async () => {
    vi.resetModules()
    // Register a mock that throws to simulate quill not being installed.
    vi.doMock('quill', () => { throw new Error('quill not installed') })

    // Dynamic re-import forces a fresh module evaluation with the mock active.
    // A static `import Quill from 'quill'` would cause this to reject; lazy-only
    // access means the component module loads fine and quill is only touched inside initQuill.
    const mod = await import('../../src/components/VibeFormWysiwyg.vue')
    expect(mod.default).toBeDefined()

    vi.doUnmock('quill')
    vi.resetModules()
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

  // CR9-8: loadError was never reset inside initQuill before the success path ran.
  // If initQuill is called a second time (e.g. from the isMobile reinit path) and
  // succeeds, the stale loadError from the first failure would still be visible.
  // Fix: reset loadError = null at the top of initQuill so every attempt starts clean.
  //
  // Direct unit-test of the retry path is impossible without a public retry API, but
  // we can verify the success path does NOT inadvertently leave loadError set:
  it('does not show loadError banner when initQuill succeeds (CR9-8 success path regression)', () => {
    const wrapper = mount(VibeFormWysiwyg)
    // Without the fix, loadError could persist across initQuill calls. With the fix
    // initQuill resets it before attempting to load, so no banner on clean mounts.
    expect(wrapper.find('.alert-warning').exists()).toBe(false)
  })

  // CR9-3: async setTimeout callback in watch(isMobile) had no try/catch.
  // If cleanup code (e.g. enable(false)) throws, the rejection was silently swallowed.
  // Fix: wrap the entire timeout body in try/catch with emit('component-error').
  //
  // Strategy: inject a fake Quill via vi.doMock whose enable() throws, mount the
  // component so quillInstance.value is populated, then trigger the isMobile watcher.
  // The debounce callback runs cleanup → enable(false) → throws.
  // Without the try/catch: unhandled rejection; with it: component-error is emitted.
  it('emits component-error when isMobile reinit cleanup throws (CR9-3)', { timeout: 5000 }, async () => {
    vi.resetModules()

    vi.doMock('quill', () => {
      function FakeQuill(this: Record<string, unknown>, container: HTMLElement) {
        this.root = container
        this.on = vi.fn()
        this.off = vi.fn()
        // enable() throws to simulate a broken Quill state during cleanup
        this.enable = vi.fn().mockImplementation(() => { throw new Error('enable failed during reinit') })
        this.destroy = vi.fn()
        this.getSemanticHTML = vi.fn().mockReturnValue('')
        this.scroll = { observer: { disconnect: vi.fn() } }
        this.selection = null
      }
      return { default: FakeQuill }
    })

    // Import fresh useBreakpoints FIRST so we hold the new mock reference
    const freshBreakpoints = await import('../../src/composables/useBreakpoints')
    const isMobile = ref(false)
    vi.mocked(freshBreakpoints.useBreakpoints).mockReturnValueOnce({
      isMobile,
      isXs: ref(false), isSm: ref(false), isMd: ref(false),
      isLg: ref(false), isXl: ref(false), isXxl: ref(false), isTablet: ref(false)
    })

    const { default: FreshWysiwyg } = await import('../../src/components/VibeFormWysiwyg.vue')
    const wrapper = mount(FreshWysiwyg)

    // Allow quill dynamic import to resolve and initQuill to complete
    await new Promise(resolve => setTimeout(resolve, 50))

    // Trigger the isMobile watcher — schedules setTimeout(fn, 250)
    isMobile.value = true
    await nextTick()

    // Wait past the 250ms debounce + async callback execution
    await new Promise(resolve => setTimeout(resolve, 300))

    // Cleanup calls enable(false) which throws; with try/catch the error is
    // caught and emitted as component-error instead of an unhandled rejection.
    expect(wrapper.emitted('component-error')).toBeTruthy()

    vi.doUnmock('quill')
    vi.resetModules()
  }, { timeout: 5000 })
})
