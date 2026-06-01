import { defineConfig, devices } from '@playwright/test'

// Playwright (the test runner) drives the *example HTML pages* end-to-end — the real
// consumer path (UMD bundle + `bootstrap` import map + CDN Vue). This is separate from
// the Vitest browser project, which tests components in isolation.
//
// NOTE: the example pages load third-party CDNs (jsDelivr, esm.sh, Unsplash), so this
// suite needs network access. It is an opt-in local/manual gate (`npm run test:examples`),
// not part of the required CI job — to keep merges independent of CDN uptime.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'off'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  // Static-serve the repo root so /examples/*.html resolve ../dist/* and same-origin assets.
  // `npm run test:examples` builds dist first.
  webServer: {
    command: 'python3 -m http.server 5174',
    url: 'http://localhost:5174/examples/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
})
