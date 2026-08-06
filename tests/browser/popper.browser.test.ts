import { defineComponent } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { expect, test, describe } from 'vitest'
import VibeTooltip from '../../src/components/VibeTooltip.vue'
import VibePopover from '../../src/components/VibePopover.vue'
import VibeDropdown from '../../src/components/VibeDropdown.vue'
import { waitForSelector, waitForGone, waitForBsInstance } from './helpers'

describe('VibeTooltip', () => {
  test('hover shows a Popper-positioned tooltip; leaving removes it', async () => {
    const Host = defineComponent({
      components: { VibeTooltip },
      template: `<div><VibeTooltip text="Helpful tip"><button type="button">Hover me</button></VibeTooltip></div>`
    })
    const screen = render(Host)
    // Bootstrap is imported on demand, so the wrapper exists before it has any hover
    // behaviour. A mouseenter sent during that window is dropped and never replayed.
    await waitForBsInstance(await waitForSelector('span[data-bs-placement]'), 'Tooltip')

    // TEMPORARY diagnostic — instrument the EXACT element the locator resolves to,
    // and record the document state, so the measurement cannot target a stale node.
    const locator = screen.getByRole('button', { name: 'Hover me' })
    const target = locator.element() as HTMLElement
    const firstButton = document.querySelector('button') as HTMLElement
    const seen: string[] = []
    for (const t of ['mouseover', 'mouseenter', 'mouseout', 'mouseleave', 'pointerover']) {
      target.addEventListener(t, () => seen.push(t))
    }
    const before = {
      sameAsFirstButton: target === firstButton,
      buttonsInDoc: document.querySelectorAll('button').length,
      spansInDoc: document.querySelectorAll('span[data-bs-placement]').length,
      connected: target.isConnected,
      rect: JSON.stringify(target.getBoundingClientRect().toJSON()),
      scroll: `${window.scrollX},${window.scrollY}`,
      inIframe: window.self !== window.top,
      frameRect: window.frameElement ? JSON.stringify((window.frameElement as HTMLElement).getBoundingClientRect().toJSON()) : 'none'
    }
    let hoverError = 'none'
    try {
      await userEvent.hover(locator)
    } catch (e) {
      hoverError = String((e as Error).message).slice(0, 120)
    }
    await new Promise(r => setTimeout(r, 800))
    const after = {
      seen,
      hoverError,
      tooltips: document.querySelectorAll('.tooltip').length,
      describedBy: target.closest('span[data-bs-placement]')?.getAttribute('aria-describedby') ?? 'none'
    }
    expect(JSON.stringify({ ...before, ...after })).toBe('DIAGNOSTIC')
    const tip = await waitForSelector('.tooltip')
    // Real Popper applies an inline transform for positioning — absent in happy-dom.
    expect((tip as HTMLElement).style.transform).not.toBe('')
    await userEvent.unhover(screen.getByRole('button', { name: 'Hover me' }))
    await waitForGone('.tooltip')
  })
})

describe('VibePopover', () => {
  test('click shows a popover; clicking the toggle again dismisses it', async () => {
    const Host = defineComponent({
      components: { VibePopover },
      template: `<div><VibePopover title="More info" text="Popover body"><button type="button">Toggle</button></VibePopover></div>`
    })
    const screen = render(Host)
    await waitForBsInstance(await waitForSelector('span[data-bs-placement]'), 'Popover')

    const toggle = screen.getByRole('button', { name: 'Toggle' })
    await userEvent.click(toggle)
    const popover = await waitForSelector('.popover')
    // Real Popper positions the popover with an inline transform — absent in happy-dom.
    expect((popover as HTMLElement).style.transform).not.toBe('')
    await userEvent.click(toggle)
    await waitForGone('.popover')
  })
})

describe('VibeDropdown', () => {
  test('toggle opens a Popper-positioned menu; ESC closes it', async () => {
    const screen = render(VibeDropdown, {
      props: { text: 'Menu', items: [{ text: 'Alpha' }, { text: 'Beta' }] }
    })
    await waitForBsInstance(await waitForSelector('.dropdown-toggle'), 'Dropdown')

    const toggle = screen.getByRole('button', { name: 'Menu' })
    await userEvent.click(toggle)
    await waitForSelector('.dropdown-menu.show')
    expect((await waitForSelector('.dropdown-toggle')).getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{Escape}')
    await waitForGone('.dropdown-menu.show')
  })
})
