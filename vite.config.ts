import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VibeUI',
      fileName: (format) => `vibeui.${format}.js`
    },
    rollupOptions: {
      external: ['vue', /^quill/],
      output: {
        globals: {
          vue: 'Vue',
          quill: 'Quill'
        }
      }
    }
  }
})

