import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VibeNavbarToggle from '../../src/components/VibeNavbarToggle.vue'
import { NAVBAR_COLLAPSE_KEY } from '../../src/injectionKeys'

const mockBsToggle = vi.fn()
const mockGetOrCreate = vi.fn(() => ({ toggle: mockBsToggle }))

vi.mock('bootstrap', () => ({
  Collapse: {
    getOrCreateInstance: mockGetOrCreate
  }
}))

const makeNavbar = (id = 'nav-main') => {
  const collapseStates: Record<string, boolean> = { [id]: false }
  const toggleCollapse = vi.fn((targetId: string) => {
    collapseStates[targetId] = !collapseStates[targetId]
  })
  return { collapseStates, toggleCollapse }
}

describe('VibeNavbarToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('with navbar context', () => {
    let navEl: HTMLElement

    beforeEach(() => {
      navEl = document.createElement('div')
      navEl.id = 'nav-main'
      document.body.appendChild(navEl)
    })

    afterEach(() => {
      document.body.removeChild(navEl)
    })

    it('calls toggleCollapse on click', async () => {
      const navbar = makeNavbar()
      const wrapper = mount(VibeNavbarToggle, {
        props: { target: 'nav-main' },
        global: { provide: { [NAVBAR_COLLAPSE_KEY as symbol]: navbar } }
      })

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(navbar.toggleCollapse).toHaveBeenCalledWith('nav-main')
    })

    // CR9-13: when navbar context is present, VibeCollapse owns Bootstrap lifecycle.
    // VibeNavbarToggle must NOT call getOrCreateInstance — that creates an uncontrolled
    // parallel Bootstrap instance and loses sync with VibeCollapse's reactive state.
    // The element IS present in DOM here; without the fix, getOrCreateInstance would be called.
    it('does NOT call Bootstrap getOrCreateInstance when navbar context is present (CR9-13)', async () => {
      const navbar = makeNavbar()
      const wrapper = mount(VibeNavbarToggle, {
        props: { target: 'nav-main' },
        global: { provide: { [NAVBAR_COLLAPSE_KEY as symbol]: navbar } }
      })

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(mockGetOrCreate).not.toHaveBeenCalled()
    })

    it('reflects expanded state from collapseStates via aria-expanded', () => {
      const navbar = makeNavbar()
      navbar.collapseStates['nav-main'] = true
      const wrapper = mount(VibeNavbarToggle, {
        props: { target: 'nav-main' },
        global: { provide: { [NAVBAR_COLLAPSE_KEY as symbol]: navbar } }
      })

      expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    })
  })

  describe('without navbar context (standalone)', () => {
    it('falls back to Bootstrap getOrCreateInstance when no navbar context', async () => {
      const el = document.createElement('div')
      el.id = 'standalone-collapse'
      document.body.appendChild(el)

      const wrapper = mount(VibeNavbarToggle, {
        props: { target: 'standalone-collapse' }
      })

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(mockGetOrCreate).toHaveBeenCalledWith(el)
      expect(mockBsToggle).toHaveBeenCalled()

      document.body.removeChild(el)
    })

    it('emits component-error when Bootstrap toggle throws (standalone)', async () => {
      mockGetOrCreate.mockImplementationOnce(() => {
        throw new Error('bs-fail')
      })

      const el = document.createElement('div')
      el.id = 'err-collapse'
      document.body.appendChild(el)

      const wrapper = mount(VibeNavbarToggle, {
        props: { target: 'err-collapse' }
      })

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('component-error')).toBeTruthy()
      const [payload] = wrapper.emitted('component-error')![0] as [{ componentName: string }]
      expect(payload.componentName).toBe('VibeNavbarToggle')

      document.body.removeChild(el)
    })
  })
})
