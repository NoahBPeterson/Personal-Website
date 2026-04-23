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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const buildDir = path.join(root, "build");
const assetsDir = path.join(buildDir, "assets");

const routes = ["/", "/loxInterpreter", "/ucode"];

const template = await fs.readFile(path.join(buildDir, "index.html"), "utf-8");
if (!template.includes('<div id="root"></div>')) {
	throw new Error(
		"build/index.html missing expected <div id=\"root\"></div> placeholder"
	);
}

const vite = await createServer({
	root,
	appType: "custom",
	server: { middlewareMode: true },
});

try {
	const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");

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

	// Render all routes up-front — PurgeCSS needs the full rendered DOM as
	// content so it can keep classes that only appear in server output (e.g.
	// ones reactstrap composes internally).
	const rendered = routes.map((url) => ({
		url,
		html: rewriteAssetPaths(
			template.replace(
				'<div id="root"></div>',
				`<div id="root">${render(url)}</div>`
			)
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
			],
			deep: [/:not/, /:hover/, /:focus/, /:active/, /:disabled/, /:checked/],
			greedy: [/^col-/, /^row/, /^container/, /^btn-/],
		},
		keyframes: true,
		fontFace: true,
		variables: true,
	});

	const purgedCss = purgeResult[0]?.css ?? originalCss;
	await fs.writeFile(mainCssPath, purgedCss);
	console.log(
		`purged ${mainCssName}: ${Buffer.byteLength(originalCss)} → ` +
			`${Buffer.byteLength(purgedCss)} bytes`
	);

	// Beasties inlines critical CSS that matches the prerendered DOM, preloads
	// the rest. `path` lets it resolve `<link href="/assets/…css">` on disk —
	// it reads the now-purged CSS.
	const beasties = new Beasties({
		path: buildDir,
		publicPath: "/",
		preload: "swap",
		logLevel: "silent",
	});

	for (const { url, html } of rendered) {
		const inlined = await beasties.process(html);
		const outPath =
			url === "/"
				? path.join(buildDir, "index.html")
				: path.join(buildDir, url.replace(/^\//, ""), "index.html");
		await fs.mkdir(path.dirname(outPath), { recursive: true });
		await fs.writeFile(outPath, inlined);
		console.log(`prerendered ${url} → ${path.relative(root, outPath)}`);
	}
} finally {
	await vite.close();
}
