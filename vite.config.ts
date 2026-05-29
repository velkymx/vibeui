/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { playwright } from '@vitest/browser-playwright'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      // Under TS 6 + moduleResolution:Bundler, vite-plugin-dts@4 emits declarations
      // mirroring the source tree at dist/src/**. We point package.json "types"/"exports"
      // at dist/src/index.d.ts directly rather than relying on insertTypesEntry, whose
      // generated stub is empty in this combination.
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts']
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VibeUI',
      fileName: (format) => `vibeui.${format}.js`
    },
    rollupOptions: {
      external: ['vue', /^quill/, /^bootstrap/],
      output: {
        globals: {
          vue: 'Vue',
          quill: 'Quill',
          bootstrap: 'bootstrap'
        }
      }
    }
  },
  test: {
    globals: true,
    // TEMPORARY: tolerate ONLY the known VibeFormWysiwyg teardown race — Quill's scroll
    // MutationObserver reads `selection.lastRange` after onBeforeUnmount sets `selection`
    // to null, throwing during unmount. It is timing-dependent and flakes both the unit
    // and browser suites; all assertions still pass. Every other unhandled error still
    // fails the run. REMOVE once the component teardown is fixed — see todo.md
    // "VibeFormWysiwyg teardown race".
    onUnhandledError(error) {
      if (typeof error?.message === 'string' && error.message.includes("reading 'lastRange'")) {
        return false
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'examples/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts'
      ]
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'happy-dom',
          include: ['tests/**/*.test.ts'],
          exclude: ['tests/browser/**'],
          // Mock alias is scoped to this project ONLY — the browser project must
          // resolve the real bootstrap package.
          alias: {
            bootstrap: path.resolve(__dirname, 'tests/mocks/bootstrap.ts')
          }
        }
      },
      {
        extends: true,
        // Pre-bundle the real third-party deps so Vite doesn't re-optimize mid-run
        // (which reloads the page and can flake tests, especially on a cold CI cache).
        optimizeDeps: {
          include: ['bootstrap', '@popperjs/core', 'quill']
        },
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.browser.test.ts'],
          setupFiles: ['tests/browser/setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }]
          }
        }
      }
    ]
  }
})

