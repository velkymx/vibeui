import { defineComponent } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from '@vitest/browser/context'
import { expect, test, describe, vi } from 'vitest'
import VibeCollapse from '../../src/components/VibeCollapse.vue'
import VibeAccordion from '../../src/components/VibeAccordion.vue'
import VibeCarousel from '../../src/components/VibeCarousel.vue'
import VibeScrollspy from '../../src/components/VibeScrollspy.vue'
import { waitForSelector } from './helpers'

describe('VibeCollapse', () => {
  test('toggling modelValue runs the real show transition to .collapse.show', async () => {
    const screen = render(VibeCollapse, {
      props: { modelValue: false },
      slots: { default: 'Hidden content' }
    })
    await screen.rerender({ modelValue: true })
    await waitForSelector('.collapse.show')
  })
})

describe('VibeAccordion', () => {
  test('opening one panel closes its sibling (real Bootstrap parent behavior)', async () => {
    const screen = render(VibeAccordion, {
      props: {
        id: 'acc1',
        items: [
          { id: 'panelA', title: 'Panel A', content: 'A body', show: true },
          { id: 'panelB', title: 'Panel B', content: 'B body' }
        ]
      }
    })
    await waitForSelector('#panelA.show')
    await userEvent.click(screen.getByRole('button', { name: 'Panel B' }))
    await waitForSelector('#panelB.show')
    await vi.waitFor(() => {
      expect(document.querySelector('#panelA.show'), 'Panel A should have closed').toBeNull()
    })
  })
})

describe('VibeCarousel', () => {
  test('clicking next advances the active slide', async () => {
    render(VibeCarousel, {
      props: {
        id: 'car1',
        ride: false,
        items: [{ captionText: 'Slide one' }, { captionText: 'Slide two' }]
      }
    })
    await waitForSelector('.carousel-item.active')
    // Native click (not userEvent) — captionless slides collapse to ~0 height so the
    // control fails Playwright's actionability check, but Bootstrap's delegated
    // data-bs-slide handler still fires on a real DOM click. We're testing the slide
    // logic, not click actionability.
    ;(await waitForSelector('.carousel-control-next') as HTMLElement).click()
    await vi.waitFor(() => {
      const items = document.querySelectorAll('.carousel-item')
      expect(items[1].classList.contains('active'), 'second slide should be active').toBe(true)
    })
  })
})

describe('VibeScrollspy', () => {
  test('scrolling the container moves the active nav link', async () => {
    const Host = defineComponent({
      components: { VibeScrollspy },
      template: `
        <div>
          <nav id="ss-nav">
            <ul class="nav nav-pills flex-column">
              <li class="nav-item"><a class="nav-link" href="#sec1">Section 1</a></li>
              <li class="nav-item"><a class="nav-link" href="#sec2">Section 2</a></li>
            </ul>
          </nav>
          <VibeScrollspy target="#ss-nav" height="120px">
            <div id="sec1" style="height: 400px">Section 1 content</div>
            <div id="sec2" style="height: 400px">Section 2 content</div>
          </VibeScrollspy>
        </div>`
    })
    render(Host)
    const root = await waitForSelector('[data-bs-spy="scroll"]') as HTMLElement
    root.scrollTop = root.scrollHeight
    await vi.waitFor(() => {
      const active = document.querySelector('#ss-nav .nav-link.active') as HTMLElement | null
      expect(active?.getAttribute('href'), 'second section should be active after scroll').toBe('#sec2')
    }, { timeout: 5000 })
  })
})
