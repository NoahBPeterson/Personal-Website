// Generates a 1200x630 Open Graph card PNG from a post's title + excerpt,
// styled to match the site (deep-indigo background, faint square motif,
// Poppins type, magenta accent). Used by scripts/prerender.mjs for any post
// that doesn't set its own `cover:` in frontmatter.
//
// Satori parses TTF/OTF/WOFF — NOT WOFF2 (its Brotli step isn't bundled), so we
// load the .woff variants @fontsource/poppins ships alongside the .woff2 ones.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const WIDTH = 1200;
const HEIGHT = 630;
const INDIGO = "#1f2251";
const MAGENTA = "#e14eca";

const fontsDir = path.join(root, "node_modules/@fontsource/poppins/files");

// Load fonts once and reuse across every card.
const [poppins400, poppins600] = await Promise.all([
	fs.readFile(path.join(fontsDir, "poppins-latin-400-normal.woff")),
	fs.readFile(path.join(fontsDir, "poppins-latin-600-normal.woff")),
]);

const fonts = [
	{ name: "Poppins", data: poppins400, weight: 400, style: "normal" },
	{ name: "Poppins", data: poppins600, weight: 600, style: "normal" },
];

// Minimal hyperscript so the tree below stays readable without JSX.
const el = (type, style, children) => ({
	type,
	props: { style, ...(children !== undefined ? { children } : {}) },
});

// The BackgroundSquares motif as CSS gradient tiles — Satori's PNG decoder
// silently drops the real square*.png blobs, and gradients let us tint them to
// sit subtly on the indigo instead of reading as bright-blue cutouts.
const SQUARE_GRADIENT = "linear-gradient(135deg, #2b6cff, #1d8cf8)";
const square = ({ size, top, bottom, left, right, rotate, radius, opacity }) =>
	el("div", {
		position: "absolute",
		width: size,
		height: size,
		...(top !== undefined ? { top } : {}),
		...(bottom !== undefined ? { bottom } : {}),
		...(left !== undefined ? { left } : {}),
		...(right !== undefined ? { right } : {}),
		borderRadius: radius,
		backgroundImage: SQUARE_GRADIENT,
		opacity,
		transform: `rotate(${rotate}deg)`,
	});

function card({ title, excerpt }) {
	return el(
		"div",
		{
			width: WIDTH,
			height: HEIGHT,
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between",
			padding: 72,
			backgroundColor: INDIGO,
			fontFamily: "Poppins",
			color: "#ffffff",
			position: "relative",
			overflow: "hidden",
		},
		[
			// Faint square motif, echoing BackgroundSquares.
			square({ size: 360, top: -130, right: -90, rotate: 16, radius: 64, opacity: 0.18 }),
			square({ size: 230, bottom: -90, left: -50, rotate: -12, radius: 44, opacity: 0.15 }),
			square({ size: 130, top: 250, right: 430, rotate: 9, radius: 28, opacity: 0.1 }),

			// Wordmark.
			el("div", { display: "flex", alignItems: "center", fontSize: 30, fontWeight: 600 }, [
				el("div", { width: 16, height: 16, borderRadius: 4, backgroundColor: MAGENTA, marginRight: 14 }),
				"Noah Peterson",
			]),

			// Title + excerpt.
			el("div", { display: "flex", flexDirection: "column" }, [
				el(
					"div",
					{ fontSize: 62, fontWeight: 600, lineHeight: 1.12, letterSpacing: -1 },
					title
				),
				excerpt
					? el(
							"div",
							{ fontSize: 30, fontWeight: 400, lineHeight: 1.4, marginTop: 28, color: "rgba(255,255,255,0.7)" },
							excerpt
						)
					: el("div", {}, ""),
			]),

			// Accent bar + URL.
			el("div", { display: "flex", flexDirection: "column" }, [
				el("div", { width: 96, height: 6, borderRadius: 3, backgroundColor: MAGENTA }),
				el("div", { fontSize: 26, fontWeight: 400, marginTop: 18, color: "rgba(255,255,255,0.6)" }, "noahpeterson.me"),
			]),
		]
	);
}

export async function renderOgCard({ title, excerpt }) {
	const svg = await satori(card({ title, excerpt }), {
		width: WIDTH,
		height: HEIGHT,
		fonts,
	});
	const png = new Resvg(svg, {
		fitTo: { mode: "width", value: WIDTH },
	})
		.render()
		.asPng();
	return png;
}
