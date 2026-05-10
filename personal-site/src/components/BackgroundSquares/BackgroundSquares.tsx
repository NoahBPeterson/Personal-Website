import React, { useEffect, useRef, useState } from "react";
import sq1 from "assets/img/square1.png";
import sq2 from "assets/img/square2.png";
import sq3 from "assets/img/square3.png";
import sq4 from "assets/img/square4.png";
import sq5 from "assets/img/square5.png";
import sq6 from "assets/img/square6.png";

const SQUARE_IMAGES = [sq1, sq2, sq3, sq4, sq5, sq6];

// Vertical pitch of one repeating block of squares. Tile positions below are
// hand-tuned to fill this band without crowding when the next tile starts.
const TILE_HEIGHT = 600;

interface SquareSpec {
	size: number;
	topPx: number;
	side: "left" | "right";
	offsetPx: number;
	imageIdx: number;
	opacity: number;
	parallax: "fast" | "slow"; // foreground squares move further with cursor
}

// One tile's worth of squares. Bounding boxes are arranged so no two squares
// overlap within a tile (and the FLIPPED tile inherits the same property).
//
//        right →                                            ← left
//                                                                  V
//   ┌──────┐                      ┌────┐                     ┌─────────┐
//   │ corner│ V[20, 80]    R[270, 330]                       │left-big │
//   └──────┘                                                 │ V[280,  │
//                                                            │   460], │
//   ┌──────────┐  ┌────┐                                     │ L[-60,  │
//   │ big      │  │mid │ V[230, 340]  R[400, 510]            │   120]  │
//   │ V[90,350]│  └────┘                                     └─────────┘
//   │ R[100,   │
//   │   360]   │                                                 ┌────┐
//   └──────────┘                                                 │left-│
//                                                                │ mid │
//   ┌────────┐  V[410, 550]                                      │ V[480,│
//   │ bottom │  R[60, 200]                                       │  570],│
//   └────────┘                                                   │ L[240,│
//                                                                │  330] │
//                                                                └────┘
const TILE: SquareSpec[] = [
	// Right column (foreground)
	{ size: 260, topPx: 90,  side: "right", offsetPx: 100, imageIdx: 0, opacity: 0.30, parallax: "fast" },
	{ size: 110, topPx: 230, side: "right", offsetPx: 400, imageIdx: 1, opacity: 0.40, parallax: "fast" },
	{ size: 60,  topPx: 20,  side: "right", offsetPx: 270, imageIdx: 4, opacity: 0.40, parallax: "fast" },
	{ size: 140, topPx: 410, side: "right", offsetPx: 60,  imageIdx: 2, opacity: 0.25, parallax: "fast" },
	// Left column (background, slower parallax, fainter)
	{ size: 180, topPx: 280, side: "left",  offsetPx: -60, imageIdx: 4, opacity: 0.20, parallax: "slow" },
	{ size: 90,  topPx: 480, side: "left",  offsetPx: 240, imageIdx: 0, opacity: 0.20, parallax: "slow" },
];

// Mirror sides on every other tile so the repeat doesn't read as obviously
// stamped. Different image indices add a bit more visual variety per row.
const TILE_FLIPPED: SquareSpec[] = TILE.map((s, i) => ({
	...s,
	side: s.side === "left" ? "right" : "left",
	imageIdx: (s.imageIdx + 3) % SQUARE_IMAGES.length,
}));

// Per-tile positional jitter — without this, each big right-side square sits
// at exactly `right: 100px` on every other tile, which reads as a vertical
// column. The shift is uniform across all squares in a tile, so within-tile
// spacing (and the no-overlap guarantee) is preserved.
//
// Bounds chosen against the smallest inter-tile gap (50px between tile 0's
// last left square and tile 1's first left square): two ±15px dy shifts can
// shrink that to 20px, still clear.
function tileJitter(tileIdx: number): { dx: number; dy: number } {
	const h1 = (tileIdx * 73 + 991) >>> 0;
	const h2 = (tileIdx * 41 + 17) >>> 0;
	return {
		dx: (h1 % 81) - 40, // ±40px lateral
		dy: (h2 % 31) - 15, // ±15px vertical
	};
}

export default function BackgroundSquares(): JSX.Element {
	const containerRef = useRef<HTMLDivElement>(null);
	const [tileCount, setTileCount] = useState(0);

	// Drive the cursor-parallax via CSS custom properties on the container, so
	// every square reads the same values and mousemove doesn't trigger a React
	// re-render of N square elements.
	useEffect(() => {
		const onMove = (e: MouseEvent) => {
			const posX = e.clientX - window.innerWidth / 2;
			const posY = e.clientY - window.innerHeight / 2;
			const el = containerRef.current;
			if (el) {
				el.style.setProperty("--cursor-x", String(posX));
				el.style.setProperty("--cursor-y", String(posY));
			}
		};
		document.documentElement.addEventListener("mousemove", onMove);
		return () => {
			document.documentElement.removeEventListener("mousemove", onMove);
		};
	}, []);

	// Self-sizing: tile count tracks the parent's measured scrollHeight.
	useEffect(() => {
		const compute = () => {
			const container = containerRef.current;
			const parent = container?.parentElement;
			if (!container || !parent) return;
			const h = parent.scrollHeight;
			if (h === 0) return;
			setTileCount(Math.max(1, Math.ceil(h / TILE_HEIGHT)));
		};
		compute();
		const ro = new ResizeObserver(compute);
		const parent = containerRef.current?.parentElement;
		if (parent) ro.observe(parent);
		window.addEventListener("resize", compute);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", compute);
		};
	}, []);

	const tiles: Array<{ tileIdx: number; squares: SquareSpec[] }> = [];
	for (let t = 0; t < tileCount; t++) {
		tiles.push({
			tileIdx: t,
			squares: t % 2 === 0 ? TILE : TILE_FLIPPED,
		});
	}

	return (
		<div
			ref={containerRef}
			className="background-squares"
			aria-hidden="true"
		>
			{tiles.map(({ tileIdx, squares }) => {
				const j = tileJitter(tileIdx);
				return squares.map((s, i) => (
					<img
						key={`${tileIdx}-${i}`}
						src={SQUARE_IMAGES[s.imageIdx]}
						alt=""
						className={`bg-square bg-square-${s.parallax}`}
						style={{
							top: `${tileIdx * TILE_HEIGHT + s.topPx + j.dy}px`,
							// "right" offsetPx is distance-from-right-edge, so a
							// rightward shift means subtracting from offsetPx; for
							// "left" we add. Both react to the same dx so the tile's
							// internal layout translates rigidly.
							[s.side]: `${
								s.side === "right" ? s.offsetPx - j.dx : s.offsetPx + j.dx
							}px`,
							width: `${s.size}px`,
							height: `${s.size}px`,
							opacity: s.opacity,
						}}
					/>
				));
			})}
		</div>
	);
}
