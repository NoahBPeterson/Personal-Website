import type { ComponentType } from "react";

export interface PostFrontmatter {
	title: string;
	date: string; // ISO date, e.g. "2026-05-07"
	excerpt?: string;
	cover?: string;
}

export interface PostModule {
	default: ComponentType;
	frontmatter: PostFrontmatter;
}

export interface PostMeta extends PostFrontmatter {
	slug: string;
}

// Eagerly load all post modules so SSR + client share a single source of truth.
// Filename (without extension) becomes the slug.
const modules = import.meta.glob<PostModule>("./*.mdx", { eager: true });

const entries: Array<{ slug: string; module: PostModule }> = Object.entries(
	modules
).map(([path, module]) => {
	const slug = path.replace(/^\.\//, "").replace(/\.mdx$/, "");
	if (!module.frontmatter) {
		throw new Error(
			`Post ${path} is missing frontmatter (need title and date)`
		);
	}
	return { slug, module };
});

export const posts: PostMeta[] = entries
	.map(({ slug, module }) => ({ slug, ...module.frontmatter }))
	.sort((a, b) => (a.date < b.date ? 1 : -1));

export function getPost(slug: string): PostModule | undefined {
	return entries.find((e) => e.slug === slug)?.module;
}

export function getAllSlugs(): string[] {
	return entries.map((e) => e.slug);
}

export const POSTS_PER_PAGE = 10;

export function getPageCount(): number {
	return Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
}

export function getPagePosts(page: number): PostMeta[] {
	const total = getPageCount();
	const clamped = Math.max(1, Math.min(page, total));
	const start = (clamped - 1) * POSTS_PER_PAGE;
	return posts.slice(start, start + POSTS_PER_PAGE);
}

export interface YearCount {
	year: string;
	count: number;
}

export function getYearCounts(): YearCount[] {
	const counts = new Map<string, number>();
	for (const p of posts) {
		const y = p.date.slice(0, 4);
		counts.set(y, (counts.get(y) ?? 0) + 1);
	}
	return Array.from(counts, ([year, count]) => ({ year, count })).sort((a, b) =>
		a.year < b.year ? 1 : -1
	);
}

export function getPostsByYear(year: string): PostMeta[] {
	return posts.filter((p) => p.date.startsWith(year + "-"));
}

export function getAdjacentPosts(slug: string): {
	newer: PostMeta | null;
	older: PostMeta | null;
} {
	const idx = posts.findIndex((p) => p.slug === slug);
	if (idx === -1) return { newer: null, older: null };
	return {
		newer: idx > 0 ? posts[idx - 1] : null,
		older: idx < posts.length - 1 ? posts[idx + 1] : null,
	};
}
