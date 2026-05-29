import { render } from 'vitest-browser-vue'
import { expect, test, describe } from 'vitest'
import VibeFormWysiwyg from '../../src/components/VibeFormWysiwyg.vue'
import { waitForSelector } from './helpers'

describe('VibeFormWysiwyg (our integration glue only)', () => {
  test('mounts a real Quill editor (init path happy-dom cannot run)', async () => {
    render(VibeFormWysiwyg, { props: { modelValue: '<p>Hello</p>' } })
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
    render(VibeFormWysiwyg, { props: { modelValue: malicious } })
    const editor = await waitForSelector('.ql-editor')
    expect(editor.textContent).toContain('safe text')
    expect(editor.innerHTML).not.toContain('onerror')
    expect(editor.innerHTML.toLowerCase()).not.toContain('<script')
    // Neither payload executed.
    expect((window as unknown as Record<string, unknown>).__xssScript).toBeUndefined()
    expect((window as unknown as Record<string, unknown>).__xssImg).toBeUndefined()
  })
})
