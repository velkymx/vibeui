import { render } from 'vitest-browser-vue'
import { expect, test } from 'vitest'
import VibeButton from '../../src/components/VibeButton.vue'

test('mounts a Vibe SFC in a real browser', async () => {
  const screen = render(VibeButton, {
    props: { variant: 'primary' },
    slots: { default: 'Click me' }
  })
  await expect.element(screen.getByRole('button', { name: 'Click me' })).toBeVisible()
})
