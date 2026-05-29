import { defineComponent } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { expect, test, describe } from 'vitest'
import VibeTooltip from '../../src/components/VibeTooltip.vue'
import VibePopover from '../../src/components/VibePopover.vue'
import VibeDropdown from '../../src/components/VibeDropdown.vue'
import { waitForSelector, waitForGone } from './helpers'

describe('VibeTooltip', () => {
  test('hover shows a Popper-positioned tooltip; leaving removes it', async () => {
    const Host = defineComponent({
      components: { VibeTooltip },
      template: `<div><VibeTooltip text="Helpful tip"><button type="button">Hover me</button></VibeTooltip></div>`
    })
    const screen = render(Host)
    await userEvent.hover(screen.getByRole('button', { name: 'Hover me' }))
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
    const toggle = screen.getByRole('button', { name: 'Menu' })
    await userEvent.click(toggle)
    await waitForSelector('.dropdown-menu.show')
    expect((await waitForSelector('.dropdown-toggle')).getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{Escape}')
    await waitForGone('.dropdown-menu.show')
  })
})
