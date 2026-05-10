import React from "react";
import { Link } from "react-router-dom";
import { posts } from "../../content/blog/posts";

function formatShortDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RecentPosts({
	count = 6,
}: {
	count?: number;
}): JSX.Element {
	const recent = posts.slice(0, count);
	if (recent.length === 0) return <p className="text-muted mb-0">No posts yet.</p>;
	return (
		<ul className="blog-recent-list">
			{recent.map((post) => (
				<li key={post.slug}>
					<Link to={`/blog/${post.slug}`}>
						<span className="blog-recent-title">{post.title}</span>
						<span className="blog-recent-date">{formatShortDate(post.date)}</span>
					</Link>
				</li>
			))}
		</ul>
	);
}
