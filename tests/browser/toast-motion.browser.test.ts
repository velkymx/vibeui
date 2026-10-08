import { render } from 'vitest-browser-vue'
import { expect, test, describe, beforeEach } from 'vitest'
import VibeToastHost from '../../src/components/VibeToastHost.vue'
import { useToast, __resetToastStoreForTests } from '../../src/composables/useToast'
import { waitForSelector, waitForGone } from './helpers'

// #149 browser half: the unit project (happy-dom) does not compile <style>
// blocks, so motion behavior is verified here against the live DOM in Chromium.
// (prefers-reduced-motion is not emulable through this harness's browser
// config, so it stays out rather than living on as a source-text assertion.
// The FLIP move class is likewise absent: TransitionGroup children are
// Teleports, so Vue never applies move classes. See #218 for that defect.)
describe('toast stack motion', () => {
  beforeEach(() => {
    __resetToastStoreForTests()
    document.body.innerHTML = ''
  })

  test('a visible toast transitions in (opacity resolves, not empty)', async () => {
    render(VibeToastHost, {})
    useToast().show('animating')
    const toast = await waitForSelector('.toast')
    const style = getComputedStyle(toast)
    expect(style.opacity).not.toBe('')
  })

  test('a dismissed toast is removed from the live DOM', async () => {
    render(VibeToastHost, {})
    const toast = useToast()
    toast.show('bye')
    await waitForSelector('.toast')
    toast.dismiss(toast.toasts[0].id)
    await waitForGone('.toast')
  })
})
