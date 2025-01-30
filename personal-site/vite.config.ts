import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'build'
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
        additionalData: `$asset-base-path: "/assets";`,
        includePaths: ['node_modules', 'src/assets/scss']
      }
    }
  }
}) 