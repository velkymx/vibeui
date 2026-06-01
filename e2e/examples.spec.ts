import { test, expect } from '@playwright/test'
import { readdirSync } from 'node:fs'

// Every example page, loaded in a real browser, must: (1) mount the Vue app — proven by
// zero leftover unresolved <vibe-*> custom elements (Vue replaces them on mount; if it
// failed to mount or a component wasn't registered, the raw tag survives), and (2) raise
// no uncaught JS errors or app console.error output. Failed CDN/image loads are ignored.
const examples = readdirSync('examples').filter((f) => f.endsWith('.html')).sort()

// Resource-load noise (CDN images, favicon) — not application errors.
const IGNORE = /Failed to load resource|favicon|net::ERR|the server responded with a status of [45]\d\d/i

for (const file of examples) {
  test(`example ${file} mounts with no console/page errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const text = msg.text()
      if (IGNORE.test(text)) return
      errors.push(`console.error: ${text}`)
    })

    await page.goto(`/examples/${file}`, { waitUntil: 'load' })
    // Allow post-mount work to settle (e.g. components' dynamic import('bootstrap')).
    await page.waitForTimeout(2000)

    // 1) Vue mounted + all components registered: no raw <vibe-*> elements remain.
    const leftover = await page.$$eval('*', (els) =>
      els
        .map((el) => el.tagName.toLowerCase())
        .filter((t) => t.startsWith('vibe-'))
    )
    expect(leftover, 'unresolved <vibe-*> elements — Vue did not mount or a component is unregistered').toEqual([])

    // 2) #app actually rendered content.
    const appChildren = await page.locator('#app > *').count()
    expect(appChildren, '#app rendered no content').toBeGreaterThan(0)

    // 3) no uncaught JS errors / app console.error.
    expect(errors, `errors on ${file}`).toEqual([])
  })
}
