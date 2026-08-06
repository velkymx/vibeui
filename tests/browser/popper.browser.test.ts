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

    // TEMPORARY diagnostic — which input paths actually reach this element?
    const locator = screen.getByRole('button', { name: 'Hover me' })
    const target = locator.element() as HTMLElement
    const log: string[] = []
    for (const t of ['pointerover', 'mouseover', 'mouseenter', 'focusin']) {
      target.addEventListener(t, () => log.push(t))
    }
    const snap = () => ({ log: [...log], tips: document.querySelectorAll('.tooltip').length })

    let hoverErr = 'none'
    try { await userEvent.hover(locator) } catch (e) { hoverErr = String((e as Error).message).slice(0, 80) }
    await new Promise(r => setTimeout(r, 400))
    const afterHover = snap()

    let clickErr = 'none'
    try { await userEvent.click(locator) } catch (e) { clickErr = String((e as Error).message).slice(0, 80) }
    await new Promise(r => setTimeout(r, 400))
    const afterClick = snap()

    target.focus()
    await new Promise(r => setTimeout(r, 400))
    const afterFocus = snap()

    target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
    await new Promise(r => setTimeout(r, 400))
    const afterSynthetic = snap()

    expect(JSON.stringify({ hoverErr, afterHover, clickErr, afterClick, afterFocus, afterSynthetic })).toBe('DIAGNOSTIC')
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
