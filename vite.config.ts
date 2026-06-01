/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
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
        // The package intentionally ships a default export (the VibeUI plugin) alongside
        // named exports (components/composables). Declaring 'named' acknowledges the mix
        // and silences Rollup's MIXED_EXPORTS warning. In UMD/CJS the default is reached
        // via `VibeUI.default` (as the examples do); the ESM `export default` is preserved.
        exports: 'named',
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
    environment: 'happy-dom',
    alias: {
      'bootstrap': path.resolve(__dirname, 'tests/mocks/bootstrap.ts')
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
    }
  }
})

