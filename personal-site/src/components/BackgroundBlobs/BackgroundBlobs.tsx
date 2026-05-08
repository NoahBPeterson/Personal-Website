import React, { useEffect, useRef, useState } from "react";
import path5 from "assets/img/path5.png";

// path5.png natural dimensions — used to derive the rendered blob's height
// from its CSS width without waiting for the image to load. Stride between
// blobs equals this rendered height, so bounding boxes touch but never
// overlap, regardless of viewport size.
const PATH5_ASPECT = 4229 / 3729;
const BLOB_WIDTH_FRACTION = 0.75;

interface Blob {
	topPx: number;
	side: "left" | "right";
	offsetPx: number;
}

export default function BackgroundBlobs(): JSX.Element {
	const containerRef = useRef<HTMLDivElement>(null);
	// Render nothing server-side; count is derived from measured page height,
	// which only exists after mount. The clip layer (overflow: hidden) prevents
	// the blobs we add from growing the page they're being measured against —
	// without it, ResizeObserver feeds back into itself and stamps blobs forever.
	const [blobs, setBlobs] = useState<Blob[]>([]);

	useEffect(() => {
		const compute = () => {
			const container = containerRef.current;
			const parent = container?.parentElement;
			if (!container || !parent) return;

			const containerWidth = container.offsetWidth;
			const pageHeight = parent.scrollHeight;
			if (containerWidth === 0 || pageHeight === 0) return;

			const blobWidth = containerWidth * BLOB_WIDTH_FRACTION;
			const blobHeight = blobWidth / PATH5_ASPECT;
			const count = Math.max(1, Math.ceil(pageHeight / blobHeight));
			const offsetPx = -Math.round(blobWidth * 0.25);

			const next: Blob[] = [];
			for (let i = 0; i < count; i++) {
				next.push({
					topPx: i * blobHeight + blobHeight / 2,
					side: i % 2 === 0 ? "right" : "left",
					offsetPx,
				});
			}
			setBlobs(next);
		};

		compute();
		// Page grows when MDX images and late-laying-out content paint in;
		// ResizeObserver catches that and lets the count catch up automatically.
		const ro = new ResizeObserver(compute);
		const parent = containerRef.current?.parentElement;
		if (parent) ro.observe(parent);
		window.addEventListener("resize", compute);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", compute);
		};
	}, []);

	return (
		<div ref={containerRef} className="background-blobs" aria-hidden="true">
			{blobs.map((b, i) => (
				<img
					key={i}
					src={path5}
					alt=""
					className="path"
					style={{
						top: `${b.topPx}px`,
						[b.side]: `${b.offsetPx}px`,
						width: `${BLOB_WIDTH_FRACTION * 100}%`,
						transform: "translateY(-50%)",
					}}
				/>
			))}
		</div>
	);
}
