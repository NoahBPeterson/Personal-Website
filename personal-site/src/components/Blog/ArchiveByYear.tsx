import React from "react";
import { Link } from "react-router-dom";
import { getYearCounts } from "../../content/blog/posts";

export default function ArchiveByYear({
	currentYear,
}: {
	currentYear?: string;
}): JSX.Element {
	const years = getYearCounts();
	if (years.length === 0) return <p className="text-muted mb-0">No posts yet.</p>;
	return (
		<ul className="blog-archive-list">
			{years.map(({ year, count }) => {
				const isCurrent = year === currentYear;
				return (
					<li key={year}>
						{isCurrent ? (
							<span className="blog-archive-current" aria-current="page">
								<span className="blog-archive-year">{year}</span>
								<span className="blog-archive-count">({count})</span>
							</span>
						) : (
							<Link to={`/blog/archive/${year}`}>
								<span className="blog-archive-year">{year}</span>
								<span className="blog-archive-count">({count})</span>
							</Link>
						)}
					</li>
				);
			})}
		</ul>
	);
}
