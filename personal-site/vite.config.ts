import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'build',
    // Emit `build/.vite/manifest.json` mapping source paths (e.g. `src/assets/img/foo.png`)
    // to hashed build paths. The prerender script uses this to rewrite dev-style
    // asset URLs that Vite's SSR dev server inlines during `ssrLoadModule`.
    manifest: true
  },
  resolve: {
    alias: {
      'assets': resolve(__dirname, 'src/assets'),
      'bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
      'blk-design-system-react': resolve(__dirname, 'src/assets/scss')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules', 'src/assets/scss'],
        quietDeps: true
      }
    }
  }
}) 