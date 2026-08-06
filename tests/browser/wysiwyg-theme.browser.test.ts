import { render } from 'vitest-browser-vue'
import { expect, test, describe, vi } from 'vitest'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'
// Quill's snow theme hardcodes its own light palette (#444 icon strokes, #fff picker
// background, near-black editor text). Inside a Bootstrap dark theme that renders as
// dark-on-dark, so VibeUI remaps those to Bootstrap's theme variables. Real browser
// only: this asserts *computed* colour, which needs the real Quill stylesheet plus
// Bootstrap's own data-bs-theme variables.
describe('VibeFormWysiwyg colour-mode awareness', () => {
  const withTheme = async (theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-bs-theme', theme)
    // Scope to the container this render owns rather than to the first match in the
    // document. The toolbar is pinned explicitly because the default one is
    // breakpoint-dependent, and the mobile variant has no picker to assert against.
    const screen = render(VibeFormWysiwyg, {
      props: {
        modelValue: '<p>Hello</p>',
        toolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic']],
        mobileToolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic']]
      }
    })
    const container = await vi.waitFor(() => {
      const el = screen.container.querySelector('.vibe-wysiwyg-container') as HTMLElement | null
      expect(el?.querySelector('.ql-editor')).toBeTruthy()
      expect(el?.querySelector('.ql-toolbar .ql-stroke')).toBeTruthy()
      expect(el?.querySelector('.ql-toolbar .ql-picker')).toBeTruthy()
      return el as HTMLElement
    }, { timeout: 4000 })
    return {
      bodyBg: getComputedStyle(document.documentElement).getPropertyValue('--bs-body-bg').trim(),
      containerStyle: getComputedStyle(container),
      stroke: getComputedStyle(container.querySelector('.ql-toolbar .ql-stroke') as SVGElement),
      picker: getComputedStyle(container.querySelector('.ql-toolbar .ql-picker') as HTMLElement)
    }
  }

  const toRgb = (cssColor: string) => {
    const probe = document.createElement('div')
    probe.style.color = cssColor
    document.body.appendChild(probe)
    const rgb = getComputedStyle(probe).color
    probe.remove()
    return rgb
  }

  // Editor *text* colour is deliberately not asserted here: Quill leaves .ql-editor to
  // inherit, so it already tracked --bs-body-color before this fix. A test for it would
  // pass with or without the theme mapping and prove nothing.

  test.each(['light', 'dark'] as const)('editor surface follows --bs-body-bg in %s mode', async theme => {
    const s = await withTheme(theme)
    expect(s.containerStyle.backgroundColor).toBe(toRgb(s.bodyBg))
    document.documentElement.removeAttribute('data-bs-theme')
  })

  test('toolbar icons are not left on Quill\'s hardcoded dark stroke in dark mode', async () => {
    const s = await withTheme('dark')
    // Quill's own value is #444 — invisible against a dark surface.
    expect(s.stroke.stroke).not.toBe(toRgb('#444'))
    expect(s.picker.color).not.toBe(toRgb('#444'))
    document.documentElement.removeAttribute('data-bs-theme')
  })
})
