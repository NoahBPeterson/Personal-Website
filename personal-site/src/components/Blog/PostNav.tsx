import React from "react";
import { Link } from "react-router-dom";
import type { PostMeta } from "../../content/blog/posts";

export default function PostNav({
	newer,
	older,
}: {
	newer: PostMeta | null;
	older: PostMeta | null;
}): JSX.Element | null {
	if (!newer && !older) return null;
	return (
		<nav className="blog-postnav" aria-label="Post navigation">
			<div className="blog-postnav-slot">
				{newer ? (
					<Link to={`/blog/${newer.slug}`} className="blog-postnav-link" rel="prev">
						<span className="blog-postnav-label">← Newer</span>
						<span className="blog-postnav-title">{newer.title}</span>
					</Link>
				) : null}
			</div>
			<div className="blog-postnav-slot blog-postnav-right">
				{older ? (
					<Link to={`/blog/${older.slug}`} className="blog-postnav-link" rel="next">
						<span className="blog-postnav-label">Older →</span>
						<span className="blog-postnav-title">{older.title}</span>
					</Link>
				) : null}
			</div>
		</nav>
	);
}
