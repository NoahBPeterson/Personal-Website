// Prerenders each route to static HTML after `vite build`, then:
//   1. Runs PurgeCSS against the built CSS bundle using the rendered HTML +
//      source files as the content source. Strips unused selectors from the
//      design-system stylesheet.
//   2. Runs Beasties on each HTML to inline critical CSS and defer the rest.
// Uses Vite's programmatic SSR API so CSS, SCSS and `?worker` imports are all
// resolved on demand — no separate SSR build step.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import Beasties from "beasties";
import { PurgeCSS } from "purgecss";
import { renderOgCard } from "./og-card.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const buildDir = path.join(root, "build");
const assetsDir = path.join(buildDir, "assets");

const staticRoutes = ["/", "/loxInterpreter", "/ucode", "/blog"];
const SITE_URL = "https://noahpeterson.me";

const template = await fs.readFile(path.join(buildDir, "index.html"), "utf-8");
if (!template.includes('<div id="root"></div>')) {
	throw new Error(
		"build/index.html missing expected <div id=\"root\"></div> placeholder"
	);
}

const vite = await createServer({
	root,
	// `mode: 'production'` makes import.meta.env.PROD = true inside the SSR-loaded
	// modules, which is how posts.ts decides whether to include draft posts.
	// Without this, the dev-mode SSR would happily prerender drafts.
	mode: "production",
	appType: "custom",
	server: { middlewareMode: true },
});

try {
	const {
		render,
		getAllSlugs,
		getPageCount,
		getYearCounts,
		posts,
		generateAtomFeed,
	} = await vite.ssrLoadModule("/src/entry-server.tsx");

	// Discover blog posts dynamically — each .mdx in src/content/blog becomes
	// its own prerendered /blog/<slug>/index.html. Pagination pages 2..N also
	// get prerendered; page 1 is the canonical /blog (already in staticRoutes).
	const postSlugs = getAllSlugs();
	const pageCount = getPageCount();
	const pageRoutes = [];
	for (let p = 2; p <= pageCount; p++) {
		pageRoutes.push(`/blog/page/${p}`);
	}
	const yearRoutes = getYearCounts().map(
		({ year }) => `/blog/archive/${year}`
	);
	const routes = [
		...staticRoutes,
		...pageRoutes,
		...yearRoutes,
		...postSlugs.map((slug) => `/blog/${slug}`),
	];

	// Vite's dev SSR (ssrLoadModule) resolves `import icon from "assets/img/foo.png"`
	// to the dev-server URL `/src/assets/img/foo.png`. That path doesn't exist in
	// the deployed build. Use the client build manifest to rewrite those URLs to
	// the hashed production paths emitted by `vite build`.
	const manifestPath = path.join(buildDir, ".vite", "manifest.json");
	const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
	const assetRewrites = new Map();
	for (const [src, entry] of Object.entries(manifest)) {
		if (entry.file && src.includes("/")) {
			assetRewrites.set(`/${src}`, `/${entry.file}`);
		}
	}
	const rewriteAssetPaths = (html) => {
		for (const [from, to] of assetRewrites) {
			html = html.split(from).join(to);
		}
		return html;
	};

	// Several CSS rules are scoped under a body class that React adds inside
	// useEffect (e.g. `.index-page .page-header ... .h1-seo`). During SSR
	// that class is absent, so Beasties thinks those rules don't match
	// anything on the page and drops them from critical CSS. When the full
	// CSS + hydration arrive the class appears and styles change visibly —
	// that's the "snap". Prerender the correct body class per route.
	const bodyClassByRoute = {
		"/": "index-page",
		"/loxInterpreter": "register-page",
		"/ucode": "register-page",
	};
	const applyBodyClass = (html, url) => {
		// All /blog and /blog/<slug> routes share the register-page styling.
		const cls = url.startsWith("/blog")
			? "register-page"
			: bodyClassByRoute[url];
		return cls ? html.replace("<body>", `<body class="${cls}">`) : html;
	};

	// Link previews (BlueSky, Slack, iMessage, etc.) read Open Graph + Twitter
	// Card tags. index.html ships site-wide defaults; per-blog-post overrides
	// happen here because the route-specific frontmatter isn't in the React
	// tree at HTML-write time.
	const escapeAttr = (s) =>
		String(s)
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	const setMeta = (html, key, value, useProperty) => {
		const attr = useProperty ? "property" : "name";
		const re = new RegExp(
			`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`
		);
		return html.replace(
			re,
			`<meta ${attr}="${key}" content="${escapeAttr(value)}" />`
		);
	};
	const postsBySlug = new Map(posts.map((p) => [p.slug, p]));

	// Auto-generate an OG card PNG for every post that doesn't set its own
	// `cover:` in frontmatter, styled to match the site (see scripts/og-card.mjs).
	// Posts WITH a `cover:` keep their hand-made image. Result is a site-root
	// path (/og/<slug>.png) used as that post's og:image below.
	const ogDir = path.join(buildDir, "og");
	await fs.mkdir(ogDir, { recursive: true });
	const cardImageBySlug = new Map();
	for (const post of posts) {
		if (post.cover) continue;
		const png = await renderOgCard({
			title: post.title,
			excerpt: post.excerpt,
		});
		await fs.writeFile(path.join(ogDir, `${post.slug}.png`), png);
		cardImageBySlug.set(post.slug, `/og/${post.slug}.png`);
		console.log(`generated og card → build/og/${post.slug}.png`);
	}

	const applyOgTags = (html, url) => {
		// Every page gets its own canonical og:url.
		let out = setMeta(html, "og:url", `${SITE_URL}${url}`, true);

		const slugMatch = url.match(/^\/blog\/([^/]+)$/);
		const post = slugMatch ? postsBySlug.get(slugMatch[1]) : null;
		if (!post) return out;

		const description = post.excerpt ?? "Blog post by Noah Peterson.";

		out = setMeta(out, "og:type", "article", true);
		out = setMeta(out, "og:title", post.title, true);
		out = setMeta(out, "og:description", description, true);
		out = setMeta(out, "twitter:title", post.title, false);
		out = setMeta(out, "twitter:description", description, false);

		// `cover` (absolute URL or site-root path) wins; otherwise fall back to
		// the auto-generated card. Either way the post gets a real og:image.
		const image = post.cover ?? cardImageBySlug.get(post.slug);
		if (image) {
			const abs = /^https?:\/\//.test(image)
				? image
				: `${SITE_URL}${image}`;
			out = setMeta(out, "og:image", abs, true);
			out = setMeta(out, "twitter:image", abs, false);
		}
		out = out.replace(
			"</head>",
			`    <meta property="article:published_time" content="${escapeAttr(
				post.date
			)}" />\n  </head>`
		);
		return out;
	};

	// Render all routes up-front — PurgeCSS needs the full rendered DOM as
	// content so it can keep classes that only appear in server output (e.g.
	// ones reactstrap composes internally).
	const rendered = routes.map((url) => ({
		url,
		html: applyOgTags(
			applyBodyClass(
				rewriteAssetPaths(
					template.replace(
						'<div id="root"></div>',
						`<div id="root">${render(url)}</div>`
					)
				),
				url
			),
			url
		),
	}));

	// Find the main CSS bundle emitted by Vite (hashed filename).
	const assetFiles = await fs.readdir(assetsDir);
	const mainCssName = assetFiles.find(
		(f) => f.startsWith("index-") && f.endsWith(".css")
	);
	if (!mainCssName) {
		throw new Error(`Could not find main CSS bundle in ${assetsDir}`);
	}
	const mainCssPath = path.join(assetsDir, mainCssName);
	const originalCss = await fs.readFile(mainCssPath, "utf-8");

	const purgeResult = await new PurgeCSS().purge({
		content: [
			// Classes actually rendered on the page.
			...rendered.map((r) => ({ raw: r.html, extension: "html" })),
			// Classes referenced in source (some only added by JS after hydration).
			"src/**/*.{tsx,ts,jsx,js}",
			"src/content/**/*.{mdx,md}",
			"index.html",
			// reactstrap composes class names internally; scan its source so we
			// keep classes like `nav-tabs`, `modal-open`, `fade`, `show`, etc.
			"node_modules/reactstrap/src/**/*.{js,jsx}",
		],
		css: [{ raw: originalCss }],
		// State/animation classes that only exist at runtime and are easily
		// missed by static scanning.
		safelist: {
			standard: [
				/^fade/,
				/^show$/,
				/^collaps/,
				/^modal-/,
				/^dropdown-/,
				/^tooltip/,
				/^popover/,
				/^active$/,
				/^disabled$/,
				/^focus$/,
				/^open$/,
				/^navbar-toggler/,
				/^nav-open$/,
				/^index-page$/,
				/^register-page$/,
				/^perfect-scrollbar/,
				// BackgroundSquares composes className via template literal
				// (bg-square-${"fast"|"slow"}), so the variant classes never
				// appear as static strings PurgeCSS can find.
				/^bg-square/,
			],
			deep: [/:not/, /:hover/, /:focus/, /:active/, /:disabled/, /:checked/],
			greedy: [/^col-/, /^row/, /^container/, /^btn-/],
		},
		keyframes: true,
		// Don't purge @font-face. PurgeCSS decides by whether the font-family
		// name appears in scanned content — but Nucleo (the icon font) is only
		// referenced via CSS class (`.tim-icons`), not by name, so it got
		// stripped and the spaceship/cubes icons broke.
		fontFace: false,
		variables: true,
	});

	const purgedCss = purgeResult[0]?.css ?? originalCss;
	await fs.writeFile(mainCssPath, purgedCss);
	console.log(
		`purged ${mainCssName}: ${Buffer.byteLength(originalCss)} → ` +
			`${Buffer.byteLength(purgedCss)} bytes`
	);

	// Inline the critical Poppins weights (Latin 400 + 600) as base64 data
	// URIs in the @font-face rules. On a slow server, even preloaded fonts
	// can miss first paint — the browser discovers the preload after HTML
	// arrives, which is already hundreds of ms in. Inlining as data URIs
	// makes the font available the instant the <style> parses, so there's
	// no snap, ever. Cost: ~18 KB gzipped extra HTML per page load.
	const fontInlines = new Map(); // filename → data URI
	for (const pattern of [
		/^poppins-latin-400-normal-.*\.woff2$/,
		/^poppins-latin-600-normal-.*\.woff2$/,
	]) {
		const match = assetFiles.find((f) => pattern.test(f));
		if (match) {
			const bytes = await fs.readFile(path.join(assetsDir, match));
			fontInlines.set(
				match,
				`data:font/woff2;base64,${bytes.toString("base64")}`
			);
		}
	}

	// Nucleo is for icons — preload rather than inline (it's 24 KB, worse
	// tradeoff, and icons are OK with a brief invisible period).
	const fontPreloads = [];
	const nucleoMatch = assetFiles.find((f) => /^nucleo-.*\.woff2$/.test(f));
	if (nucleoMatch) {
		fontPreloads.push(
			`<link rel="preload" as="font" type="font/woff2" href="/assets/${nucleoMatch}" crossorigin>`
		);
	}
	const fontPreload = fontPreloads.join("\n    ");

	// Beasties inlines critical CSS that matches the prerendered DOM, preloads
	// the rest. `path` lets it resolve `<link href="/assets/…css">` on disk —
	// it reads the now-purged CSS.
	const beasties = new Beasties({
		path: buildDir,
		publicPath: "/",
		preload: "swap",
		// Inline @font-face rules in the critical CSS. Without this, they sit
		// in the deferred stylesheet and first paint uses the fallback font
		// even though the woff2 is already preloaded — causing a visible
		// fallback→Poppins snap when the CSS eventually loads.
		inlineFonts: true,
		preloadFonts: false, // we manually preload only the critical weight
		logLevel: "silent",
	});

	const atomLink =
		'<link rel="alternate" type="application/atom+xml" title="Blog feed" href="/blog/feed.xml">';

	for (const { url, html } of rendered) {
		// Insert preloads high in <head> — before any <style>/<script> so the
		// preload scanner picks them up as early as possible. Place right
		// after the first <meta charset>.
		const withFontPreload = fontPreload
			? html.replace(
					'<meta charset="UTF-8" />',
					`<meta charset="UTF-8" />\n    ${fontPreload}`
				)
			: html;
		// Discoverable Atom feed link on every /blog* route.
		const withAtomLink = url.startsWith("/blog")
			? withFontPreload.replace("</head>", `    ${atomLink}\n  </head>`)
			: withFontPreload;
		let inlined = await beasties.process(withAtomLink);

		// Replace the Poppins 400/600 woff2 URLs with base64 data URIs in
		// the @font-face rules Beasties just inlined. Do this after Beasties
		// so it doesn't try to inline the entire data URI into its logic.
		for (const [filename, dataUri] of fontInlines) {
			inlined = inlined.split(`/assets/${filename}`).join(dataUri);
		}
		const outPath =
			url === "/"
				? path.join(buildDir, "index.html")
				: path.join(buildDir, url.replace(/^\//, ""), "index.html");
		await fs.mkdir(path.dirname(outPath), { recursive: true });
		await fs.writeFile(outPath, inlined);
		console.log(`prerendered ${url} → ${path.relative(root, outPath)}`);
	}

	// Atom feed at /blog/feed.xml. Generator lives in src/content/blog/feed.ts
	// so it's shared with the dev server middleware in vite.config.ts.
	const feedXml = generateAtomFeed(posts, SITE_URL);
	const feedPath = path.join(buildDir, "blog", "feed.xml");
	await fs.mkdir(path.dirname(feedPath), { recursive: true });
	await fs.writeFile(feedPath, feedXml);
	console.log(`wrote ${path.relative(root, feedPath)}`);
} finally {
	await vite.close();
}
