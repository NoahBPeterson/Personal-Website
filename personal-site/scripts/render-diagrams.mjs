// Renders every .mmd file under src/content/blog/diagrams/ to a sibling .svg.
// Run with `bun run diagrams` after editing diagram sources.
//
// SVGs are committed alongside the .mmd source so the regular build doesn't
// need to spin up a browser (mmdc uses puppeteer/chromium, ~250 MB).

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const diagramsDir = path.join(root, "src/content/blog/diagrams");

// Dark mermaid config tuned for the site's #1f2251 background. mermaid embeds
// the theme variables into the rendered SVG, so the diagram stays legible if
// the user opens the SVG directly outside the page context.
const config = {
	theme: "base",
	themeVariables: {
		darkMode: true,
		background: "transparent",
		primaryColor: "#1f2251",
		primaryTextColor: "#ffffff",
		primaryBorderColor: "#e14eca",
		lineColor: "#9aa1c8",
		secondaryColor: "#262a55",
		tertiaryColor: "#1a1d40",
		fontFamily: "Poppins, sans-serif",
		// sequence diagram bits
		actorBkg: "#1f2251",
		actorBorder: "#e14eca",
		actorTextColor: "#ffffff",
		actorLineColor: "#9aa1c8",
		signalColor: "#ffffff",
		signalTextColor: "#ffffff",
		labelBoxBkgColor: "#262a55",
		labelBoxBorderColor: "#e14eca",
		labelTextColor: "#ffffff",
		loopTextColor: "#ffffff",
		noteBkgColor: "#262a55",
		noteTextColor: "#ffffff",
		noteBorderColor: "#1d8cf8",
	},
};

const configPath = path.join(diagramsDir, ".mermaid-config.json");
await fs.writeFile(configPath, JSON.stringify(config, null, "\t"));

const entries = await fs.readdir(diagramsDir);
const sources = entries.filter((f) => f.endsWith(".mmd"));
if (sources.length === 0) {
	console.log("no .mmd files in", diagramsDir);
	process.exit(0);
}

for (const file of sources) {
	const inPath = path.join(diagramsDir, file);
	const outPath = inPath.replace(/\.mmd$/, ".svg");
	console.log("rendering", file, "->", path.basename(outPath));
	execFileSync(
		"bunx",
		[
			"mmdc",
			"-i",
			inPath,
			"-o",
			outPath,
			"-c",
			configPath,
			"-b",
			"transparent",
		],
		{ stdio: "inherit", cwd: root }
	);
}

await fs.unlink(configPath);
console.log("done — rendered", sources.length, "diagram(s)");
