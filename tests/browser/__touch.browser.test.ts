import { defineComponent } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { test, expect } from 'vitest'
import VibeTooltip from '../../src/components/VibeTooltip.vue'

// TEMPORARY diagnostic — removed in the follow-up commit.
test('probe tooltip hover path', async () => {
  const Host = defineComponent({
    components: { VibeTooltip },
    template: `<div><VibeTooltip text="Helpful tip"><button type="button">Hover me</button></VibeTooltip></div>`
  })
  const screen = render(Host)
  await new Promise(r => setTimeout(r, 300))

  const span = document.querySelector('span[data-bs-placement]') as HTMLElement
  const btn = screen.getByRole('button', { name: 'Hover me' })

  const before = {
    spanFound: !!span,
    trigger: span?.getAttribute('data-bs-trigger'),
    title: span?.getAttribute('data-bs-title'),
    rect: span ? JSON.stringify(span.getBoundingClientRect().toJSON()) : null,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  }

  await userEvent.hover(btn)
  await new Promise(r => setTimeout(r, 600))
  const afterHover = document.querySelectorAll('.tooltip').length

  // Does a manually dispatched mouseover produce the tooltip?
  span?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
  await new Promise(r => setTimeout(r, 600))
  const afterManual = document.querySelectorAll('.tooltip').length

  expect(JSON.stringify({ ...before, afterHover, afterManual })).toBe('DIAGNOSTIC')
})
