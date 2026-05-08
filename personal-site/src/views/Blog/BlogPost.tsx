import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "reactstrap";
import { MDXProvider } from "@mdx-js/react";

import IndexNavbar from "../../components/Navbars/IndexNavbar";
import Footer from "../../components/Footer/Footer";
import BackgroundBlobs from "../../components/BackgroundBlobs/BackgroundBlobs";
import { getPost } from "../../content/blog/posts";

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
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

	return (
		<>
			<IndexNavbar activeSection="blog" />
			<div className="wrapper">
				<div className="blog-page">
					<BackgroundBlobs />
					<Container>
						<div className="mx-auto" style={{ maxWidth: 760 }}>
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
								<Link to="/blog">← Back to blog</Link>
							</div>
						</div>
					</Container>
				</div>
				<Footer />
			</div>
		</>
	);
}
