import React, { useState } from "react";

interface Props {
	videoId: string;
	title?: string;
	width?: number;
	height?: number;
}

// Renders a thumbnail + play button until the user clicks. Avoids loading
// YouTube's ~1.5MB embed payload (player JS, ads, fonts) for visitors who
// never play the video.
export default function YouTubeFacade({
	videoId,
	title = "YouTube video",
	width = 560,
	height = 315,
}: Props) {
	const [activated, setActivated] = useState(false);

	if (activated) {
		return (
			<iframe
				width={width}
				height={height}
				src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			/>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setActivated(true)}
			aria-label={`Play ${title}`}
			style={{
				position: "relative",
				width,
				maxWidth: "100%",
				aspectRatio: `${width} / ${height}`,
				padding: 0,
				border: "none",
				background: "#000",
				cursor: "pointer",
				display: "block",
			}}
		>
			<img
				src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
				alt=""
				loading="lazy"
				style={{
					width: "100%",
					height: "100%",
					display: "block",
					objectFit: "cover",
				}}
			/>
			<span
				aria-hidden
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: 68,
					height: 48,
					background: "rgba(0,0,0,0.75)",
					borderRadius: 14,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					pointerEvents: "none",
				}}
			>
				<span
					style={{
						width: 0,
						height: 0,
						borderStyle: "solid",
						borderWidth: "10px 0 10px 17px",
						borderColor: "transparent transparent transparent white",
						marginLeft: 4,
					}}
				/>
			</span>
		</button>
	);
}
