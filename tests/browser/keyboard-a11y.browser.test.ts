import { defineComponent, ref } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { expect, test, describe } from 'vitest'
import VibeTabs from '../../src/components/VibeTabs.vue'
import VibeTab from '../../src/components/VibeTab.vue'
import VibeSortable from '../../src/components/VibeSortable.vue'
import VibeDatePicker from '../../src/components/VibeDatePicker.vue'
import { waitForSelector } from './helpers'

// #272 keyboard-only AT pass, automated in a real browser (Playwright/Chromium).
// happy-dom unit tests assert tabindex attributes and activeElement, but focus
// movement, roving-tabindex Tab stops, and focus-return are only truly exercised
// where the browser owns the focus ring. These drive each flow with real key
// events (no pointer) and assert focus lands where APG requires and never strands
// on document.body. Screen-reader announcement rows (#272 run-book 8/10/12/13/14)
// still need a human: an automated harness cannot read what a screen reader speaks.

// Focus must never be left on the page body after a keyboard interaction (WCAG 2.4.3
// has no normative "not body" rule, but a stranded body focus means the next Tab
// restarts from the top, which the keyboard-only DoD forbids).
const focusNotStranded = () => {
  expect(document.activeElement).not.toBe(document.body)
  expect(document.activeElement).not.toBeNull()
}

describe('VibeTabs keyboard model (#234 run-book 6/7)', () => {
  const Host = defineComponent({
    components: { VibeTabs, VibeTab },
    setup() {
      const active = ref('a')
      return { active }
    },
    template: `
      <div>
        <button type="button">before</button>
        <VibeTabs v-model="active">
          <VibeTab name="a" label="Alpha">Alpha body</VibeTab>
          <VibeTab name="b" label="Beta">Beta body</VibeTab>
          <VibeTab name="c" label="Gamma">Gamma body</VibeTab>
        </VibeTabs>
      </div>`
  })

  test('Tab reaches exactly one tab stop; ArrowRight/Home/End move focus and activation', async () => {
    const screen = render(Host)
    const tabs = () => Array.from(document.querySelectorAll('[role="tab"]')) as HTMLElement[]
    await waitForSelector('[role="tab"]')

    // Roving tabindex: only the active tab is a Tab stop.
    expect(tabs().map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])

    // Tab from the preceding button lands on the first (and only) tab stop.
    screen.getByRole('button', { name: 'before' }).element().focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(tabs()[0])
    focusNotStranded()

    // ArrowRight moves focus and activation to Beta.
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(tabs()[1])
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true')
    expect(tabs().map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', '-1'])
    focusNotStranded()

    // End jumps to the last tab, Home back to the first.
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(tabs()[2])
    await userEvent.keyboard('{Home}')
    expect(document.activeElement).toBe(tabs()[0])
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true')
    focusNotStranded()
  })
})

describe('VibeSortable keyboard reorder (#234 run-book 3/4)', () => {
  const Host = defineComponent({
    components: { VibeSortable },
    setup() {
      const items = ref(['Alpha', 'Beta', 'Gamma'])
      return { items }
    },
    template: `
      <VibeSortable v-model="items">
        <template #default="{ item }">{{ item }}</template>
      </VibeSortable>`
  })

  test('Space grabs, ArrowDown reorders, and focus follows the moved row', async () => {
    render(Host)
    const rows = () => Array.from(document.querySelectorAll('[data-vibe-sortable-item]')) as HTMLElement[]
    await waitForSelector('[data-vibe-sortable-item]')

    expect(rows()[0].getAttribute('tabindex')).toBe('0')
    rows()[0].focus()
    expect(document.activeElement).toBe(rows()[0])

    await userEvent.keyboard(' ')
    expect(rows()[0].getAttribute('aria-grabbed')).toBe('true')

    await userEvent.keyboard('{ArrowDown}')
    expect(rows().map((r) => r.textContent?.trim())).toEqual(['Beta', 'Alpha', 'Gamma'])
    // Focus follows the moved row to its new index so the next arrow keeps moving it.
    expect(document.activeElement).toBe(rows()[1])
    focusNotStranded()
  })

  test('Escape cancels a grab and leaves the order unchanged', async () => {
    render(Host)
    const rows = () => Array.from(document.querySelectorAll('[data-vibe-sortable-item]')) as HTMLElement[]
    await waitForSelector('[data-vibe-sortable-item]')

    rows()[0].focus()
    await userEvent.keyboard(' ')
    expect(rows()[0].getAttribute('aria-grabbed')).toBe('true')
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{ArrowDown}')
    expect(rows().map((r) => r.textContent?.trim())).toEqual(['Alpha', 'Beta', 'Gamma'])
    focusNotStranded()
  })
})

describe('VibeDatePicker keyboard reachability (#272 run-book 9)', () => {
  // KNOWN GAP, filed as #299 (WCAG 2.1.1 / 2.4.3): opening the calendar leaves
  // focus on the trigger input, and the grid keydown handler lives on the popover
  // (a sibling of the input), so a keyboard-only user cannot navigate days or
  // Escape-close from the input. This test PINS the current broken behavior so the
  // regression is tracked; flip both asserts to the fixed expectation under #299
  // (focus moves into the grid on open, Escape closes and returns focus to input).
  test('[pinned #299] opening the calendar leaves focus on the input, not in the grid', async () => {
    const screen = render(VibeDatePicker, { props: { modelValue: '2025-04-15' } })
    const input = screen.getByRole('textbox').element() as HTMLInputElement

    await userEvent.click(input)
    const popover = await waitForSelector('.vibe-datepicker-popover')

    // Current behavior: focus is still the input and is NOT inside the grid.
    expect(document.activeElement).toBe(input)
    expect(popover.contains(document.activeElement)).toBe(false)
    focusNotStranded()
  })
})
