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
