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
    render(Host)
    // Bootstrap is imported on demand, so the wrapper exists before it has any hover
    // behaviour. An event sent during that window is dropped and never replayed.
    const wrapper = await waitForSelector('span[data-bs-placement]')
    await waitForBsInstance(wrapper, 'Tooltip')

    // Bootstrap's hover trigger listens for mouseover/mouseout on the wrapper, and those
    // are dispatched directly instead of being driven through the harness's mouse.
    // Headless CI does not deliver pointer *movement* into Vitest's test iframe at all:
    // instrumenting the element there showed userEvent.hover() producing no events
    // whatsoever, and even a real click arriving as focusin with no mouseover. What this
    // test exists to prove — that real Bootstrap JS and real Popper build and position
    // the tooltip — is unaffected, since both still run exactly as they do for a user.
    wrapper.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
    const tip = await waitForSelector('.tooltip')
    // Real Popper applies an inline transform for positioning — absent in happy-dom.
    expect((tip as HTMLElement).style.transform).not.toBe('')
    wrapper.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))
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
