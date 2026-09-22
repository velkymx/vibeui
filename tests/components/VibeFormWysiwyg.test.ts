import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'
import * as useBreakpointsModule from '../../src/composables/useBreakpoints'
import { VIBE_WYSIWYG_KEY } from '../../src/composables/wysiwygConfig'
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

// Minimal Quill stub with the surface VibeFormWysiwyg calls. Consumers now inject
// the loader, so tests provide this instead of the library importing quill.
function makeStubQuill(overrides: Record<string, unknown> = {}) {
  const instances: any[] = []
  class StubQuill {
    root: HTMLElement = document.createElement('div')
    static instances = instances
    on = vi.fn()
    off = vi.fn()
    enable = vi.fn()
    destroy = vi.fn()
    getText = vi.fn().mockReturnValue('')
    getSemanticHTML = vi.fn().mockReturnValue('<p>x</p>')
    setContents = vi.fn()
    clipboard = { convert: vi.fn().mockReturnValue({}), dangerouslyPasteHTML: vi.fn() }
    selection: unknown = {}
    scroll = { observer: { disconnect: vi.fn() } }
    constructor(container: HTMLElement, _opts: unknown) {
      if (container) this.root = document.createElement('div')
      instances.push(this)
      // Instance overrides win over the class-field defaults above.
      Object.assign(this, overrides)
    }
  }
  return StubQuill
}

/** mount options that inject a stub Quill loader (and optional sanitizer). */
function withQuill(quill: unknown, sanitizer?: (h: string) => string) {
  return {
    global: {
      provide: {
        [VIBE_WYSIWYG_KEY as symbol]: {
          quillLoader: () => Promise.resolve(quill),
          ...(sanitizer ? { sanitizer } : {})
        }
      }
    }
  }
}

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('VibeFormWysiwyg', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the editor container when a Quill loader is provided', () => {
    const wrapper = mount(VibeFormWysiwyg, withQuill(makeStubQuill()))
    expect(wrapper.find('.vibe-wysiwyg-container').exists()).toBe(true)
  })

  describe('toolbar presets (prop plumbing)', () => {
    for (const preset of ['minimal', 'standard', 'full'] as const) {
      it(`accepts "${preset}" preset`, () => {
        const wrapper = mount(VibeFormWysiwyg, { props: { toolbar: preset }, ...withQuill(makeStubQuill()) })
        expect(wrapper.props('toolbar')).toBe(preset)
      })
    }

    it('accepts a custom array (preserves Quill format)', () => {
      const custom = [['bold'], [{ header: 1 }]]
      const wrapper = mount(VibeFormWysiwyg, { props: { toolbar: custom }, ...withQuill(makeStubQuill()) })
      expect(wrapper.props('toolbar')).toEqual(custom)
    })

    it('accepts toolbar=false to disable', () => {
      const wrapper = mount(VibeFormWysiwyg, { props: { toolbar: false }, ...withQuill(makeStubQuill()) })
      expect(wrapper.props('toolbar')).toBe(false)
    })
  })

  describe('peer injection', () => {
    it('initializes using an injected quillLoader', async () => {
      const StubQuill = makeStubQuill()
      const wrapper = mount(VibeFormWysiwyg, {
        props: { id: 'w1', modelValue: '<p>hi</p>' },
        ...withQuill(StubQuill)
      })
      await flush(); await wrapper.vm.$nextTick()
      expect((StubQuill as any).instances.length).toBe(1)
      expect(wrapper.emitted('component-error')).toBeFalsy()
    })

    it('a prop quillLoader overrides the injected one', async () => {
      const Injected = makeStubQuill()
      const PropQuill = makeStubQuill()
      const wrapper = mount(VibeFormWysiwyg, {
        props: { id: 'w2', quillLoader: () => Promise.resolve(PropQuill) },
        ...withQuill(Injected)
      })
      await flush(); await wrapper.vm.$nextTick()
      expect((PropQuill as any).instances.length).toBe(1)
      expect((Injected as any).instances.length).toBe(0)
    })

    it('emits component-error and shows the fallback when no loader is provided', async () => {
      const wrapper = mount(VibeFormWysiwyg, { props: { id: 'w3' } })
      await flush(); await wrapper.vm.$nextTick()
      const err = wrapper.emitted('component-error')
      expect(err).toBeTruthy()
      expect((err![0][0] as any).message).toMatch(/quill/i)
      expect(wrapper.find('.alert').exists()).toBe(true)
      expect(wrapper.find('.vibe-wysiwyg-container').exists()).toBe(false)
    })

    it('applies an injected sanitizer to the model HTML', async () => {
      const StubQuill = makeStubQuill()
      const sanitizer = vi.fn((h: string) => h)
      mount(VibeFormWysiwyg, {
        props: { id: 'w4', modelValue: '<p>ok</p>' },
        ...withQuill(StubQuill, sanitizer)
      })
      await flush()
      expect(sanitizer).toHaveBeenCalledWith('<p>ok</p>')
    })
  })

  // Regression: isUnmounted guard — Quill must not construct on a detached container
  // if unmount fires before the loader promise resolves.
  it('does not inject .ql-editor after component unmounts during async init', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const wrapper = mount(VibeFormWysiwyg, { attachTo: el, ...withQuill(makeStubQuill()) })
    wrapper.unmount()
    await flush()
    expect(el.querySelector('.ql-editor')).toBeNull()
    document.body.removeChild(el)
  })

  it('cleans up handlers on unmount without throwing', async () => {
    const wrapper = mount(VibeFormWysiwyg, withQuill(makeStubQuill()))
    await flush()
    expect(() => wrapper.unmount()).not.toThrow()
  })

  // CR9-8: loadError must reset at the top of initQuill so a clean mount shows no banner.
  it('does not show the loadError banner when init succeeds (CR9-8)', () => {
    const wrapper = mount(VibeFormWysiwyg, withQuill(makeStubQuill()))
    expect(wrapper.find('.alert-warning').exists()).toBe(false)
  })

  // CR9-3: the async setTimeout callback in watch(isMobile) is wrapped in try/catch, so a
  // throw during reinit cleanup surfaces as component-error rather than an unhandled rejection.
  it('emits component-error when isMobile reinit cleanup throws (CR9-3)', { timeout: 5000 }, async () => {
    const isMobile = ref(false)
    vi.mocked(useBreakpointsModule.useBreakpoints).mockReturnValueOnce({
      isMobile,
      isXs: ref(false), isSm: ref(false), isMd: ref(false),
      isLg: ref(false), isXl: ref(false), isXxl: ref(false), isTablet: ref(false)
    })
    // enable() throws to simulate a broken Quill state during cleanup.
    const ThrowingQuill = makeStubQuill({
      enable: vi.fn().mockImplementation(() => { throw new Error('enable failed during reinit') })
    })
    const wrapper = mount(VibeFormWysiwyg, withQuill(ThrowingQuill))
    await new Promise((r) => setTimeout(r, 50))

    isMobile.value = true
    await nextTick()
    await new Promise((r) => setTimeout(r, 300))

    expect(wrapper.emitted('component-error')).toBeTruthy()
  })
})
