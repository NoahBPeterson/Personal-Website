import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

import IndexNavbar from "../../components/Navbars/IndexNavbar";
import Footer from "../../components/Footer/Footer";
import BackgroundSquares from "../../components/BackgroundSquares/BackgroundSquares";
import BlogSidebar from "../../components/Blog/BlogSidebar";
import {
	getPagePosts,
	getPageCount,
	getPostsByYear,
	type PostMeta,
} from "../../content/blog/posts";

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	// Frontmatter dates are bare YYYY-MM-DD, which Date parses as UTC midnight.
	// Format in UTC so a viewer in a negative-offset timezone doesn't see the
	// previous day.
	return d.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}

// Page 1 is canonical at /blog (no /page/1) so search engines and analytics
// don't see the same content under two URLs.
function pageHref(n: number): string {
	return n === 1 ? "/blog" : `/blog/page/${n}`;
}

// Pagination links are SPA navigations — react-router preserves scroll
// position by default. Force scroll-to-top on click so the new page's first
// post lands above the fold instead of mid-page.
function jumpToTop() {
	window.scrollTo(0, 0);
}

function Pagination({
	current,
	total,
}: {
	current: number;
	total: number;
}): JSX.Element | null {
	if (total <= 1) return null;
	const numbers = Array.from({ length: total }, (_, i) => i + 1);
	return (
		<nav className="blog-pagination" aria-label="Blog pagination">
			{current > 1 ? (
				<Link
					to={pageHref(current - 1)}
					className="blog-page-step"
					rel="prev"
					onClick={jumpToTop}
				>
					← Newer
				</Link>
			) : (
				<span className="blog-page-step disabled" aria-hidden="true">
					← Newer
				</span>
			)}
			<ol>
				{numbers.map((n) => (
					<li key={n}>
						{n === current ? (
							<span className="blog-page-current" aria-current="page">
								{n}
							</span>
						) : (
							<Link to={pageHref(n)} onClick={jumpToTop}>
								{n}
							</Link>
						)}
					</li>
				))}
			</ol>
			{current < total ? (
				<Link
					to={pageHref(current + 1)}
					className="blog-page-step"
					rel="next"
					onClick={jumpToTop}
				>
					Older →
				</Link>
			) : (
				<span className="blog-page-step disabled" aria-hidden="true">
					Older →
				</span>
			)}
		</nav>
	);
}

function PostCard({ post }: { post: PostMeta }): JSX.Element {
	return (
		<Link to={`/blog/${post.slug}`} className="d-block text-decoration-none mb-4">
			<article className="card p-4">
				<h3 className="mb-1">{post.title}</h3>
				<p className="text-muted mb-2">{formatDate(post.date)}</p>
				{post.excerpt && <p className="mb-0">{post.excerpt}</p>}
			</article>
		</Link>
	);
}

export default function BlogIndex(): JSX.Element {
	const params = useParams();
	const archiveYear = params.year;

	// Page-mode (default): paginated post list. Archive-mode: filtered by year.
	const totalPages = getPageCount();
	const requested = params.page ? parseInt(params.page, 10) : 1;
	const currentPage =
		Number.isFinite(requested) && requested >= 1
			? Math.min(requested, totalPages)
			: 1;

	const visiblePosts = archiveYear
		? getPostsByYear(archiveYear)
		: getPagePosts(currentPage);

	const heading = archiveYear ? `Archive: ${archiveYear}` : "Blog";
	const description = archiveYear
		? `Posts from ${archiveYear}.`
		: "Notes on what I'm building and learning.";

	useEffect(() => {
		document.body.classList.add("register-page");
		return () => {
			document.body.classList.remove("register-page");
		};
	}, []);

	return (
		<>
			<IndexNavbar activeSection="blog" />
			<div className="wrapper">
				<div className="blog-page">
					<BackgroundSquares />
					<Container>
						<header className="blog-header">
							<h1 className="title" style={{ marginBottom: "0.5rem" }}>
								{heading}
							</h1>
							<p
								style={{
									color: "rgba(255, 255, 255, 0.7)",
									margin: 0,
								}}
							>
								{description}
							</p>
							{archiveYear && (
								<p style={{ marginTop: "0.5rem", marginBottom: 0 }}>
									<Link to="/blog" className="blog-archive-back">
										← All posts
									</Link>
								</p>
							)}
						</header>
						<Row>
							<Col md="8">
								{visiblePosts.length === 0 ? (
									<p className="text-white">No posts yet — check back soon.</p>
								) : (
									visiblePosts.map((post) => (
										<PostCard post={post} key={post.slug} />
									))
								)}
								{!archiveYear && (
									<Pagination current={currentPage} total={totalPages} />
								)}
							</Col>
							<Col md="4">
								<BlogSidebar currentYear={archiveYear} />
							</Col>
						</Row>
					</Container>
				</div>
				<Footer />
			</div>
		</>
	);
}
