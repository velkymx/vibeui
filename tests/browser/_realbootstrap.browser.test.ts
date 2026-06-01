import { render } from 'vitest-browser-vue'
import { test } from 'vitest'
import VibeModal from '../../src/components/VibeModal.vue'
import { waitForSelector } from './helpers'

// The happy-dom mock NEVER creates a .modal-backdrop element. Its presence proves
// the real Bootstrap Modal JS executed (no mock alias leaked into this project).
test('real Bootstrap JS runs: opening a modal creates a .modal-backdrop', async () => {
  render(VibeModal, { props: { modelValue: true, title: 'Real BS' }, slots: { default: 'Body' } })
  await waitForSelector('.modal.show')
  await waitForSelector('.modal-backdrop')
})
