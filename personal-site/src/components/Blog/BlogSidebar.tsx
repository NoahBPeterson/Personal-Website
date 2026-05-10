import React from "react";
import RecentPosts from "./RecentPosts";
import ArchiveByYear from "./ArchiveByYear";

export default function BlogSidebar({
	currentYear,
}: {
	currentYear?: string;
}): JSX.Element {
	return (
		<aside className="blog-sidebar">
			<section className="blog-sidebar-section">
				<h4>Recent posts</h4>
				<RecentPosts />
			</section>
			<section className="blog-sidebar-section">
				<h4>Archive</h4>
				<ArchiveByYear currentYear={currentYear} />
			</section>
			<section className="blog-sidebar-section">
				<a
					href="/blog/feed.xml"
					className="blog-rss-link"
					rel="alternate"
					type="application/atom+xml"
				>
					<i className="tim-icons icon-bell-55" /> Subscribe via RSS
				</a>
			</section>
		</aside>
	);
}
