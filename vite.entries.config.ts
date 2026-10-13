/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// #180: ESM-only sub-path entries for the heavy components (charts, WYSIWYG)
// so lazy loaders download just the component, not the whole library. The
// main vite.config.ts build is untouched (single-entry UMD + ESM + CSS + dts);
// this config emits only the entry chunks (ESM). Component styles stay in the
// main vibeui.css (which already bundles every SFC style), so this build drops
// its extracted CSS and sub-path consumers import style.css alongside, exactly
// like single-entry consumers. Type declarations for the entries come from the
// main build's dts output.
const dropCss = () => ({
  name: 'vibe-drop-entry-css',
  enforce: 'post' as const,
  generateBundle(_options: unknown, bundle: Record<string, { fileName?: string }>) {
    for (const key of Object.keys(bundle)) {
      if (key.endsWith('.css')) delete bundle[key]
    }
  },
})

export default defineConfig({
  plugins: [vue(), dropCss()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        'chart-line': path.resolve(__dirname, 'src/chart-line.ts'),
        'chart-bar': path.resolve(__dirname, 'src/chart-bar.ts'),
        'chart-pie': path.resolve(__dirname, 'src/chart-pie.ts'),
        wysiwyg: path.resolve(__dirname, 'src/wysiwyg.ts'),
        // #283: DataTable ships its own entry so lazy loaders pull just the
        // component (and its @tanstack/table engine), not the whole library.
        datatable: path.resolve(__dirname, 'src/datatable.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      // @tanstack/* stays external so the datatable entry references the engine
      // as a peer import rather than inlining it per entry build.
      external: ['vue', /^quill/, /^bootstrap/, /^dompurify/, /^@tanstack\//],
    },
  },
})
