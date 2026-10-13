import { expect, test, describe, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import VibeDataTable from '../../src/components/VibeDataTable.vue'
import { waitForSelector } from './helpers'

// #283 Phase 5: virtualization needs real layout (happy-dom reports zero
// rects), so scrolling behavior is proven here, not in the unit suite.
describe('VibeDataTable virtualization', () => {
  test('windows rows and reveals the tail after scrolling', async () => {
    render(VibeDataTable, {
      props: {
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' }
        ],
        items: Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` })),
        paginated: false,
        virtualized: true,
        virtualEstimateSize: 48,
        virtualHeight: 400
      }
    })
    const scroller = (await waitForSelector('.table-responsive')) as HTMLElement
    // First window only: the tail is not rendered yet.
    expect(document.body.textContent).toContain('Row 1')
    expect(document.body.textContent).not.toContain('Row 100')
    // Scroll to the bottom; the window follows and the tail renders.
    scroller.scrollTop = scroller.scrollHeight
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Row 100')
    })
  })
})
