import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    // MDX must run before the React plugin so the React plugin sees JSX.
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [
          remarkGfm,
          remarkFrontmatter,
          // Exposes parsed frontmatter as a named `frontmatter` export from each .mdx file.
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
        ],
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    // Dev-only: serve /blog/feed.xml from the same generator the build uses.
    // In production the prerender script writes a static feed.xml under build/;
    // without this middleware, the dev SPA fallback returns index.html which
    // React-Router matches as /blog/:slug → "Post not found".
    {
      name: 'serve-feed-xml-in-dev',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url || req.url.split('?')[0] !== '/blog/feed.xml') {
            return next()
          }
          try {
            const [{ posts }, { generateAtomFeed }] = await Promise.all([
              server.ssrLoadModule('/src/content/blog/posts.ts'),
              server.ssrLoadModule('/src/content/blog/feed.ts'),
            ])
            const host = req.headers.host ?? 'localhost:5173'
            const proto = (req.socket as any).encrypted ? 'https' : 'http'
            const xml = generateAtomFeed(posts, `${proto}://${host}`)
            res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8')
            res.end(xml)
          } catch (err) {
            next(err as Error)
          }
        })
      },
    },
  ],
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