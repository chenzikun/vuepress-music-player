import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VuepressPluginMusicPlayer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['node:path', 'node:url', 'path', 'url'],
      output: {
        exports: 'default'
      }
    }
  }
})
