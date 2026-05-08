import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

import IndexNavbar from "../../components/Navbars/IndexNavbar";
import Footer from "../../components/Footer/Footer";
import BackgroundBlobs from "../../components/BackgroundBlobs/BackgroundBlobs";
import { posts } from "../../content/blog/posts";

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export default function BlogIndex(): JSX.Element {
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
					<BackgroundBlobs />
					<Container>
						<header className="blog-header">
							<h1 className="title" style={{ marginBottom: "0.5rem" }}>
								Blog
							</h1>
							<p
								style={{
									color: "rgba(255, 255, 255, 0.7)",
									margin: 0,
								}}
							>
								Notes on what I'm building and learning.
							</p>
						</header>
						{posts.length === 0 ? (
							<p className="text-white">No posts yet — check back soon.</p>
						) : (
							<Row>
								{posts.map((post) => (
									<Col md="8" className="mx-auto mb-4" key={post.slug}>
										<Link
											to={`/blog/${post.slug}`}
											className="d-block text-decoration-none"
										>
											<article className="card p-4">
												<h3 className="mb-1">{post.title}</h3>
												<p className="text-muted mb-2">
													{formatDate(post.date)}
												</p>
												{post.excerpt && (
													<p className="mb-0">{post.excerpt}</p>
												)}
											</article>
										</Link>
									</Col>
								))}
							</Row>
						)}
					</Container>
				</div>
				<Footer />
			</div>
		</>
	);
}
