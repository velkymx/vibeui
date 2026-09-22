import { render } from 'vitest-browser-vue'
import { expect, test, describe, vi } from 'vitest'
import DOMPurify from 'dompurify'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'
import { VIBE_WYSIWYG_KEY } from '../../src/composables/wysiwygConfig'
import { makeDomPurifySanitizer } from '../../src/utils/sanitizeHtml'
import { waitForSelector } from './helpers'

// The library no longer imports quill/dompurify itself — the consumer injects them.
// Here the browser project has both installed, so we provide a real loader + sanitizer.
const wysiwygProvide = {
  global: {
    provide: {
      [VIBE_WYSIWYG_KEY as symbol]: {
        quillLoader: () => import('quill'),
        sanitizer: makeDomPurifySanitizer(DOMPurify)
      }
    }
  }
}

describe('VibeFormWysiwyg (our integration glue only)', () => {
  test('mounts a real Quill editor (init path happy-dom cannot run)', async () => {
    render(VibeFormWysiwyg, { props: { modelValue: '<p>Hello</p>' }, ...wysiwygProvide })
    // Quill builds .ql-toolbar + .ql-editor only when it initializes against real layout.
    await waitForSelector('.ql-toolbar')
    const editor = await waitForSelector('.ql-editor')
    expect(editor.textContent).toContain('Hello')
  })

  test('our sanitizeHtml layer strips dangerous markup before it reaches the editor', async () => {
    // Reset any prior pollution.
    delete (window as unknown as Record<string, unknown>).__xssScript
    delete (window as unknown as Record<string, unknown>).__xssImg
    const malicious =
      '<p>safe text</p>' +
      '<script>window.__xssScript = true<\/script>' +
      '<img src="x" onerror="window.__xssImg = true">'
    render(VibeFormWysiwyg, { props: { modelValue: malicious }, ...wysiwygProvide })
    const editor = await waitForSelector('.ql-editor')
    expect(editor.textContent).toContain('safe text')
    expect(editor.innerHTML).not.toContain('onerror')
    expect(editor.innerHTML.toLowerCase()).not.toContain('<script')
    // Neither payload executed.
    expect((window as unknown as Record<string, unknown>).__xssScript).toBeUndefined()
    expect((window as unknown as Record<string, unknown>).__xssImg).toBeUndefined()
  })

  test('unmounting tears down Quill cleanly — no error thrown', async () => {
    // Capture errors ourselves so the vite.config `onUnhandledError` filter (which
    // currently tolerates the lastRange teardown race) cannot hide a regression here.
    const errors: string[] = []
    const onErr = (e: ErrorEvent) => { errors.push(e.message) }
    window.addEventListener('error', onErr)
    try {
      const screen = render(VibeFormWysiwyg, { props: { modelValue: '<p>Teardown</p>' }, ...wysiwygProvide })
      const editor = await waitForSelector('.ql-editor')
      ;(editor as HTMLElement).focus()
      screen.unmount()
      // Let Quill's scroll MutationObserver flush against the now-removed DOM.
      await new Promise((r) => setTimeout(r, 50))
    } finally {
      window.removeEventListener('error', onErr)
    }
    expect(errors.filter((m) => m.includes('lastRange'))).toEqual([])
  })
})
