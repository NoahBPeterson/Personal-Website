import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "reactstrap";
import { MDXProvider } from "@mdx-js/react";

import IndexNavbar from "../../components/Navbars/IndexNavbar";
import Footer from "../../components/Footer/Footer";
import BackgroundSquares from "../../components/BackgroundSquares/BackgroundSquares";
import PostNav from "../../components/Blog/PostNav";
import { getPost, getAdjacentPosts } from "../../content/blog/posts";

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	// Frontmatter dates are bare YYYY-MM-DD → parsed as UTC midnight. Format in
	// UTC so viewers in negative-offset timezones don't see the previous day.
	return d.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}

// Make rendered markdown elements responsive and styled. Images get max-width
// so authors don't have to size them per-post.
const mdxComponents = {
	img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
		<img
			{...props}
			loading="lazy"
			style={{ maxWidth: "100%", height: "auto", borderRadius: 6 }}
		/>
	),
};

interface BlogPostProps {
	slug?: string;
}

export default function BlogPost({ slug: slugProp }: BlogPostProps): JSX.Element {
	const params = useParams();
	const slug = slugProp ?? params.slug;
	const post = slug ? getPost(slug) : undefined;

	useEffect(() => {
		document.body.classList.add("register-page");
		return () => {
			document.body.classList.remove("register-page");
		};
	}, []);

	if (!post) {
		return (
			<>
				<IndexNavbar activeSection="blog" />
				<div className="wrapper">
					<div className="section pt-5">
						<Container className="pt-5">
							<h2>Post not found</h2>
							<Link to="/blog">← Back to blog</Link>
						</Container>
					</div>
					<Footer />
				</div>
			</>
		);
	}

	const { default: PostBody, frontmatter } = post;
	const { newer, older } = getAdjacentPosts(slug ?? "");

	return (
		<>
			<IndexNavbar activeSection="blog" />
			<div className="wrapper">
				<div className="blog-page">
					<BackgroundSquares />
					<Container>
						<article className="blog-post-panel mx-auto">
							<header className="blog-header">
								<h1 className="title" style={{ marginBottom: "0.5rem" }}>
									{frontmatter.title}
								</h1>
								<p
									style={{
										color: "rgba(255, 255, 255, 0.6)",
										margin: 0,
									}}
								>
									{formatDate(frontmatter.date)}
								</p>
							</header>
							<div className="blog-post">
								<MDXProvider components={mdxComponents}>
									<PostBody />
								</MDXProvider>
								<hr className="my-5" />
								<PostNav newer={newer} older={older} />
								<p className="mt-4 mb-0">
									<Link to="/blog">← Back to blog</Link>
								</p>
							</div>
						</article>
					</Container>
				</div>
				<Footer />
			</div>
		</>
	);
}
