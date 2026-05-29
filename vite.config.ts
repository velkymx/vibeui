/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
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

