import type { PostMeta } from "./posts";

const escapeXml = (s: string): string =>
	String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

const toIso = (dateStr: string): string => {
	const d = new Date(dateStr);
	return Number.isNaN(d.getTime()) ? dateStr : d.toISOString();
};

// Generates an Atom 1.0 feed for the given posts. siteUrl should be the
// scheme + host without a trailing slash (e.g. "https://noahpeterson.me").
// Used by the build (scripts/prerender.mjs writes to build/blog/feed.xml)
// and the dev server (vite.config.ts middleware serves it on demand).
export function generateAtomFeed(posts: PostMeta[], siteUrl: string): string {
	const updated =
		posts.length > 0 ? toIso(posts[0].date) : new Date().toISOString();
	const entries = posts
		.map(
			(p) => `  <entry>
    <title>${escapeXml(p.title)}</title>
    <link href="${siteUrl}/blog/${p.slug}" />
    <id>${siteUrl}/blog/${p.slug}</id>
    <updated>${toIso(p.date)}</updated>
    <published>${toIso(p.date)}</published>${
				p.excerpt ? `\n    <summary>${escapeXml(p.excerpt)}</summary>` : ""
			}
  </entry>`
		)
		.join("\n");
	return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Noah Peterson's blog</title>
  <link href="${siteUrl}/blog" />
  <link rel="self" type="application/atom+xml" href="${siteUrl}/blog/feed.xml" />
  <id>${siteUrl}/blog</id>
  <updated>${updated}</updated>
${entries}
</feed>
`;
}
